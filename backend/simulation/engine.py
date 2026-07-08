import random
from apscheduler.schedulers.background import BackgroundScheduler
from sqlmodel import Session
from database import engine as db_engine
from models import ExceptionEvent

from orchestration.graph_workflow import agent_app
from graph.enricher import GraphEnricher
from models import AgentAction

scheduler = BackgroundScheduler()

SEMICONDUCTOR_CASES = [
    {
        "title": "Cooling System Failure on EUV Stepper",
        "description": "Coolant pressure dropped below critical threshold on MAC_ASML_1. Immediate risk of thermal expansion, lens distortion, and wafer misalignment.",
        "node": "MAC_ASML_1",
        "severity": "critical"
    },
    {
        "title": "Photoresist Contamination Detected",
        "description": "Batch of photoresist chemical from SUP_CHEM shows particulate contamination exceeding 15nm. Risk of short circuits on logic wafers.",
        "node": "SUP_CHEM",
        "severity": "high"
    },
    {
        "title": "Pressure Spikes in CVD Reactor",
        "description": "Precursor gas flow from SUP_GAS fluctuating wildly in MAC_CVD_1, leading to uneven deposition layers on 3D NAND wafers.",
        "node": "MAC_CVD_1",
        "severity": "medium"
    }
]

def generate_random_exception():
    template = random.choice(SEMICONDUCTOR_CASES)
    
    new_event = ExceptionEvent(
        title=template["title"],
        description=template["description"],
        node=template["node"],
        severity=template["severity"],
        status="pending"
    )
    
    with Session(db_engine) as session:
        session.add(new_event)
        session.commit()
        # We need to refresh to ensure new_event gets its ID assigned by the database
        session.refresh(new_event)
        print(f"🔥 SIMULATION ENGINE: Fired new event -> {new_event.title}")
        
        # Convert the event to a dictionary and send it to the AI Orchestrator
        event_dict = {
            "title": new_event.title,
            "description": new_event.description,
            "node": new_event.node,
            "severity": new_event.severity
        }
        
        # Determine Graph Context for LangGraph based on Node
        graph_context = {}
        if template["node"].startswith("SUP_"):
            impact = GraphEnricher.get_supplier_impact(template["node"])
            graph_context["blast_radius"] = impact
        elif template["node"].startswith("MAC_"):
            impact = GraphEnricher.get_machine_impact(template["node"])
            graph_context["blast_radius"] = impact
            
        test_state = {
            "exception_id": new_event.id,
            "exception_data": event_dict,
            "graph_context": graph_context,
            "messages": [],
            "current_agent": "",
            "recommendation": ""
        }
        
        final_state = agent_app.invoke(test_state)
        
        # Save Agent Recommendation
        agent_action = AgentAction(
            exception_id=new_event.id,
            agent_name="Orchestrator",
            recommendation=final_state["recommendation"] or "No recommendation provided.",
            confidence=0.92
        )
        session.add(agent_action)
        session.commit()
        print(f"✅ AI ACTION SAVED: {agent_action.agent_name} recommended -> {agent_action.recommendation}")

def start_simulation():
    # Fire an exception immediately for the demo
    scheduler.add_job(generate_random_exception)
    # Then schedule one every 60 seconds
    scheduler.add_job(generate_random_exception, 'interval', seconds=60)
    scheduler.start()
    print("⏱️ Simulation Engine started! (1 exception every 60 seconds for live demo)")