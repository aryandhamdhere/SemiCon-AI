from sqlmodel import Session, select
from database import engine
from models import ExceptionEvent
from datetime import datetime

def calculate_mttr():
    """Calculates Mean Time to Resolve (MTTR) across all approved exceptions."""
    with Session(engine) as session:
        statement = select(ExceptionEvent).where(ExceptionEvent.status == "approved")
        exceptions = session.exec(statement).all()
        
        if not exceptions:
            return 0
        
        total_time_seconds = 0
        for exc in exceptions:
            # For demo, we assume current time is the resolution time since we don't store resolved_at yet.
            # In production, we'd use exc.resolved_at - exc.created_at
            resolution_time = (datetime.utcnow() - exc.created_at).total_seconds()
            total_time_seconds += resolution_time
            
        mttr_minutes = (total_time_seconds / len(exceptions)) / 60
        return round(mttr_minutes, 2)
