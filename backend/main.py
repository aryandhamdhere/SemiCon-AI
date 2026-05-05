from sqlmodel import SQLModel, create_engine, Session, select
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import create_db_and_tables
from contextlib import asynccontextmanager
import httpx
from typing import List, Dict

# Import our routers and the simulation engine
from routers import exceptions, agents
from simulation.engine import start_simulation

# --- BETA 3: IMPORT NEO4J GRAPH CLIENT ---
from graph.neo4j_client import graph_db
from models import ExceptionEvent

# Define the database engine
sqlite_url = "sqlite:///database.db"
engine = create_engine(sqlite_url)

# --- GLOBAL STATE FOR AGENT LOGS ---
# This holds the "thoughts" of the agents for the frontend to poll
agent_logs: List[Dict] = []

# --- SLACK CONFIGURATION ---
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/HERE"

async def send_slack_notification(message: str):
    payload = {"text": message}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(SLACK_WEBHOOK_URL, json=payload)
            return response.status_code == 200
    except Exception as e:
        print(f"❌ Slack Notification Error: {e}")
        return False

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    start_simulation()
    yield

app = FastAPI(title="Agentic Supply Chain API", version="Beta 3", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(exceptions.router)
app.include_router(agents.router)

@app.get("/")
def read_root():
    return {"status": "Backend is running!", "version": "Beta 3"}

# --- AGENT LOGGING ENDPOINTS ---

@app.get("/agents/logs")
def get_agent_logs():
    """Returns the latest activities from the LangGraph agents for the Dashboard"""
    return agent_logs[-15:]  # Return last 15 logs to keep the feed fresh

@app.post("/agents/logs")
def add_agent_log(log: Dict):
    """
    Endpoint for LangGraph nodes to report progress.
    Expected format: {"agent": "Supply Agent", "message": "Analyzing inventory..."}
    """
    agent_logs.append(log)
    # Keep the list from growing infinitely in memory
    if len(agent_logs) > 100:
        agent_logs.pop(0)
    return {"status": "Logged"}



# --- KNOWLEDGE GRAPH VISUALIZATION ENDPOINT ---
@app.get("/graph/visualize")
def get_graph_data():
    query = """
    MATCH (n)-[r]->(m)
    RETURN n.id AS source_id, labels(n)[0] AS source_label, n.name AS source_name,
           m.id AS target_id, labels(m)[0] AS target_label, m.name AS target_name,
           type(r) AS rel_type
    """
    try:
        results = graph_db.query(query)
        nodes = {}
        links = []
        for row in results:
            nodes[row["source_id"]] = {"id": row["source_id"], "label": row["source_label"], "name": row["source_name"]}
            nodes[row["target_id"]] = {"id": row["target_id"], "label": row["target_label"], "name": row["target_name"]}
            links.append({"source": row["source_id"], "target": row["target_id"], "type": row["rel_type"]})
        return {"nodes": list(nodes.values()), "links": links}
    except Exception as e:
        print(f"❌ Graph API Error: {e}")
        return {"error": str(e), "nodes": [], "links": []}