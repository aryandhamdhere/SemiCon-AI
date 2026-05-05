import json
from sqlmodel import Session
from models import AuditLog
from database import engine

def log_action(actor_id: str, actor_role: str, action_type: str, target_id: str, payload_dict: dict, model_version: str = None):
    """
    Immutable Audit Log.
    Records every critical action, approval, or agent recommendation.
    """
    with Session(engine) as session:
        log_entry = AuditLog(
            actor_id=actor_id,
            actor_role=actor_role,
            action_type=action_type,
            target_id=target_id,
            payload=json.dumps(payload_dict),
            model_version=model_version
        )
        session.add(log_entry)
        session.commit()
        return log_entry.id
