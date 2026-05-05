from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime, timezone

# Table 1: Stores the supply chain exceptions (e.g., weather delays)
class ExceptionEvent(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: str
    node: str
    severity: str  # 'critical', 'high', 'medium'
    status: str = Field(default="pending")  # 'pending', 'approved', 'dismissed'
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Table 2: Stores the AI agent's recommendations
class AgentAction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    exception_id: int = Field(foreign_key="exceptionevent.id")
    agent_name: str
    recommendation: str
    confidence: float
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# Table 3: Audit Log for Governance (Beta 4)
class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    actor_id: str  # User ID or Agent ID
    actor_role: str # Operator, Manager, Agent, etc.
    action_type: str # e.g., 'approve_exception', 'agent_recommendation', 'override_action'
    target_id: str # e.g., Exception ID
    payload: str # JSON string of inputs/outputs
    model_version: Optional[str] = None # LLM model version used if actor is Agent
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))