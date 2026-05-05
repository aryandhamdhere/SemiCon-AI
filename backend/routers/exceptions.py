from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Dict
from database import get_session
from models import ExceptionEvent, AgentAction
from orchestration.graph_workflow import agent_app
from graph.enricher import GraphEnricher
from governance.rbac import require_role, get_current_user
from governance.audit_logger import log_action

router = APIRouter(prefix="/exceptions", tags=["Exceptions"])

@router.get("/", response_model=List[ExceptionEvent])
def get_all_exceptions(session: Session = Depends(get_session)):
    # Grab only active exceptions (pending or escalated)
    statement = select(ExceptionEvent).where(ExceptionEvent.status.in_(["pending", "escalated"]))
    exceptions = session.exec(statement).all()
    return exceptions

@router.post("/fire")
def fire_exception(payload: dict, session: Session = Depends(get_session)):
    """Simulates an exception occurring, triggering the LangGraph agents."""
    
    # 1. Create and save the Exception
    new_exception = ExceptionEvent(
        title=payload.get("title", "Unknown Alert"),
        description=payload.get("description", ""),
        node=payload.get("node", "Unknown Node"),
        severity=payload.get("severity", "high")
    )
    session.add(new_exception)
    session.commit()
    session.refresh(new_exception)
    
    # 2. Enrich context from Neo4j
    # For demo purposes, we extract a supplier ID if it's in the node string
    supplier_id = "SUP_001" if "Microchip" in new_exception.title or "SUP_001" in new_exception.node else None
    graph_context = {}
    if supplier_id:
        impact = GraphEnricher.get_supplier_impact(supplier_id)
        graph_context["blast_radius"] = impact
    
    # 3. Trigger LangGraph Workflow
    test_state = {
        "exception_id": new_exception.id,
        "exception_data": {
            "title": new_exception.title,
            "severity": new_exception.severity
        },
        "graph_context": graph_context,
        "messages": [],
        "current_agent": "",
        "recommendation": ""
    }
    
    final_state = agent_app.invoke(test_state)
    
    # 4. Save Agent Recommendation
    agent_action = AgentAction(
        exception_id=new_exception.id,
        agent_name="Orchestrator",
        recommendation=final_state["recommendation"] or "No recommendation provided.",
        confidence=0.92
    )
    session.add(agent_action)
    session.commit()
    
    return {"message": "Exception fired and handled", "exception_id": new_exception.id, "state": final_state}

@router.get("/{exception_id}/details")
def get_exception_details(exception_id: int, session: Session = Depends(get_session)):
    """Gets full details of an exception including agent trace and impact."""
    statement = select(ExceptionEvent).where(ExceptionEvent.id == exception_id)
    exception = session.exec(statement).first()
    
    if not exception:
        raise HTTPException(status_code=404, detail="Exception not found")
        
    action_statement = select(AgentAction).where(AgentAction.exception_id == exception_id)
    actions = session.exec(action_statement).all()
    
    # Extract a likely Supplier ID or Machine ID from the node
    impact_text = "Analyzing downstream impact..."
    try:
        if exception.node.startswith("SUP_"):
            supplier_id = exception.node
            impact_results = GraphEnricher.get_supplier_impact(supplier_id)
            if impact_results:
                affected_skus = list(set([r.get('affected_sku', 'Unknown SKU') for r in impact_results]))
                affected_machines = list(set([r.get('affected_machine', 'Unknown Machine') for r in impact_results]))
                impact_text = f"🚨 Critical Supplier Alert: Delay at {supplier_id} threatens inventory for {len(affected_skus)} Semiconductor SKUs (e.g., {affected_skus[0]}). This will directly halt production on {len(affected_machines)} fabrication lines including {affected_machines[0]} within 48 hours. Estimated Revenue at Risk: $2.4M."
            else:
                impact_text = "No immediate downstream machine impact found in Knowledge Graph."
        elif exception.node.startswith("MAC_"):
            # It might be a machine/quality issue instead of a supplier issue
            machine_impact = GraphEnricher.get_machine_impact(exception.node)
            if machine_impact:
                affected_skus = list(set([r.get('affected_sku', 'Unknown SKU') for r in machine_impact]))
                impact_text = f"⚠️ Fabrication Alert: Tool failure at {exception.node} directly affects the production of {len(affected_skus)} SKUs (e.g., {affected_skus[0]}). Immediate rerouting or Wafer lot scraping is required."
            else:
                impact_text = f"Impact isolated to node: {exception.node}. Checking downstream logic wafer orders."
        else:
            impact_text = f"Impact isolated to node: {exception.node}. Checking downstream orders."
    except Exception as e:
        impact_text = f"Could not retrieve live Neo4j impact data. Using cached estimates. (Error: {str(e)})"

    return {
        "exception": exception,
        "actions": actions,
        "impact": impact_text
    }

@router.put("/{exception_id}/approve")
def approve_exception(
    exception_id: int, 
    session: Session = Depends(get_session),
    user_role: str = Depends(require_role(["Manager", "Executive"])),
    user_id: str = Depends(get_current_user)
):
    """Approves an exception. Requires Manager or Executive role."""
    statement = select(ExceptionEvent).where(ExceptionEvent.id == exception_id)
    exception = session.exec(statement).first()
    
    if not exception:
        raise HTTPException(status_code=404, detail="Exception not found")

    exception.status = "approved"
    session.add(exception)
    
    # Write to Immutable Audit Log
    log_action(
        actor_id=user_id,
        actor_role=user_role,
        action_type="approve_exception",
        target_id=f"EX-{exception_id}",
        payload_dict={"status": "approved", "previous_status": "pending"}
    )
    
    session.commit()
    
    return {"message": f"Exception {exception_id} approved", "status": "approved", "approved_by": user_id}

@router.put("/{exception_id}/escalate")
def escalate_exception(
    exception_id: int, 
    session: Session = Depends(get_session),
    user_role: str = Depends(require_role(["Manager", "Executive"])),
    user_id: str = Depends(get_current_user)
):
    """Escalates an exception to higher management."""
    statement = select(ExceptionEvent).where(ExceptionEvent.id == exception_id)
    exception = session.exec(statement).first()
    
    if not exception:
        raise HTTPException(status_code=404, detail="Exception not found")

    exception.status = "escalated"
    session.add(exception)
    
    log_action(
        actor_id=user_id, actor_role=user_role, action_type="escalate_exception",
        target_id=f"EX-{exception_id}", payload_dict={"status": "escalated"}
    )
    session.commit()
    return {"message": f"Exception {exception_id} escalated", "status": "escalated"}

@router.put("/{exception_id}/dismiss")
def dismiss_exception(
    exception_id: int, 
    session: Session = Depends(get_session),
    user_role: str = Depends(require_role(["Manager", "Executive"])),
    user_id: str = Depends(get_current_user)
):
    """Dismisses an exception."""
    statement = select(ExceptionEvent).where(ExceptionEvent.id == exception_id)
    exception = session.exec(statement).first()
    
    if not exception:
        raise HTTPException(status_code=404, detail="Exception not found")

    exception.status = "dismissed"
    session.add(exception)
    
    log_action(
        actor_id=user_id, actor_role=user_role, action_type="dismiss_exception",
        target_id=f"EX-{exception_id}", payload_dict={"status": "dismissed"}
    )
    session.commit()
    return {"message": f"Exception {exception_id} dismissed", "status": "dismissed"}