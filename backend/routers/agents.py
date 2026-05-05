from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List
from database import get_session
from models import AgentAction

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/actions", response_model=List[AgentAction])
def get_all_agent_actions(session: Session = Depends(get_session)):
    # This grabs all rows from the AgentAction table
    actions = session.exec(select(AgentAction)).all()
    return actions