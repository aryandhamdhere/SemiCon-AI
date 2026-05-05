from sqlmodel import Session
from database import engine as db_engine
from models import AgentAction
from agents.supply_agent import process_supply_exception

def handle_new_exception(exception_id: int, exception_data: dict):
    """Routes the exception to the correct AI agent and saves the result."""
    print(f"🚦 ORCHESTRATOR: Routing exception #{exception_id} to Supply Agent...")
    
    # 1. Get the AI's recommendation
    result = process_supply_exception(exception_data)
    
    # 2. Save the AI's action to the database
    new_action = AgentAction(
        exception_id=exception_id,
        agent_name="Supply Logistics Agent",
        recommendation=str(result["recommendedActions"]),
        confidence=result["confidence"]
    )
    
    with Session(db_engine) as session:
        session.add(new_action)
        session.commit()
        print(f"✅ AI ACTION SAVED: {new_action.agent_name} recommended -> {new_action.recommendation}")