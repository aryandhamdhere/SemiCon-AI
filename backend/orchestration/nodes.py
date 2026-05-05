import os
import requests
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from orchestration.state import AgentState

load_dotenv()

# Initialize the LLM (Gemini 2.0 Flash - fast and available on v1beta)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.2, google_api_key=os.environ.get("GEMINI_API_KEY"))

# Helper function to send "thoughts" to the Dashboard
def report_to_dashboard(agent_name: str, message: str):
    """Sends a log entry to the FastAPI backend to update the Live Activity Feed."""
    try:
        # Note: In production, use an environment variable for the backend URL
        requests.post("http://localhost:8000/agents/logs", json={
            "agent": agent_name,
            "message": message
        }, timeout=1)
    except Exception as e:
        # We pass silently so the agent doesn't crash if the dashboard is offline
        print(f"  [System] Failed to report to dashboard: {e}")

# 🧑‍💼 AGENT 1: The Supply Agent
def supply_agent(state: AgentState) -> AgentState:
    msg = "Analyzing missing inventory and tracing supply chain dependencies in Neo4j..."
    print(f"  [Supply Agent] {msg}")
    report_to_dashboard("Supply Agent", msg)
    
    # Extract context
    exception_data = state.get("exception_data", {})
    graph_context = state.get("graph_context", {})
    
    # Let Gemini figure out the solution!
    prompt = f"""
    You are an expert Supply Chain Logistics AI. 
    An exception has occurred: {exception_data.get('title')}
    Severity: {exception_data.get('severity')}
    Description: {exception_data.get('description')}
    
    Our Neo4j Knowledge Graph traced the exact downstream impact (Blast Radius):
    {graph_context}
    
    Generate a precise, 1-2 sentence emergency recommendation to mitigate this specific delay and protect the affected downstream machines/SKUs. Be highly specific.
    """
    
    report_to_dashboard("Supply Agent", "Querying Gemini 1.5 Flash for optimal rerouting strategy...")
    
    try:
        response = llm.invoke(prompt)
        recommendation = response.content
    except Exception as e:
        print(f"LLM Error: {e}")
        affected_machine = graph_context.get("affected_machine", "Unknown Machine")
        recommendation = f"Reroute emergency inventory to keep {affected_machine} running and contact backup suppliers."
    
    report_to_dashboard("Supply Agent", f"Strategic recommendation formed.")
    
    return {
        "messages": ["Supply Agent investigated logistics and generated a dynamic mitigation plan via Gemini."],
        "current_agent": "Supply Agent",
        "recommendation": recommendation
    }

# 🕵️‍♂️ AGENT 2: The Quality Agent
def quality_agent(state: AgentState) -> AgentState:
    msg = "Correlating machine sensor data with historical defect rates..."
    print(f"  [Quality Agent] {msg}")
    report_to_dashboard("Quality Agent", msg)
    
    # Extract context
    exception_data = state.get("exception_data", {})
    graph_context = state.get("graph_context", {})
    
    prompt = f"""
    You are an expert Factory Quality Control AI. 
    An equipment exception has occurred: {exception_data.get('title')}
    Severity: {exception_data.get('severity')}
    Description: {exception_data.get('description')}
    
    Our Neo4j Knowledge Graph traced the downstream product impact:
    {graph_context}
    
    Generate a precise, 1-2 sentence technical recommendation for the maintenance crew to fix this equipment and save the affected SKUs. Be highly specific.
    """
    
    report_to_dashboard("Quality Agent", "Querying Gemini 1.5 Flash for maintenance protocols...")
    
    try:
        response = llm.invoke(prompt)
        recommendation = response.content
    except Exception as e:
        print(f"LLM Error: {e}")
        recommendation = "Dispatch maintenance crew to recalibrate machine tolerances and perform deep-clean."
    
    report_to_dashboard("Quality Agent", "Maintenance ticket generated for machine stabilization.")
    
    return {
        "messages": ["Quality Agent reviewed machine health and generated a technical repair plan via Gemini."],
        "current_agent": "Quality Agent",
        "recommendation": recommendation
    }