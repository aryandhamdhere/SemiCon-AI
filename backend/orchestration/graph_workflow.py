from langgraph.graph import StateGraph, END
from orchestration.state import AgentState
from orchestration.nodes import supply_agent, quality_agent
from graph.enricher import GraphEnricher

# 🚦 THE ROUTER: Decides where the exception goes first
def route_exception(state: AgentState):
    title = state["exception_data"].get("title", "").lower()
    
    # If the issue mentions a supplier or missing parts, go to Supply
    if "supplier" in title or "delay" in title or "inventory" in title:
        return "supply_agent"
    # Otherwise, assume it's a factory/machine issue and go to Quality
    else:
        return "quality_agent"

# 🏗️ BUILD THE GRAPH WORKFLOW
def build_agent_workflow():
    # 1. Initialize the State Graph using our AgentState "clipboard"
    workflow = StateGraph(AgentState)

    # 2. Add our "Worker" Nodes
    workflow.add_node("supply_agent", supply_agent)
    workflow.add_node("quality_agent", quality_agent)

    # 3. Define the Routing Logic
    # We use a conditional edge from the special 'START' node
    workflow.set_conditional_entry_point(
        route_exception,
        {
            "supply_agent": "supply_agent",
            "quality_agent": "quality_agent"
        }
    )

    # 4. Once an agent is done, the workflow ends (for now)
    workflow.add_edge("supply_agent", END)
    workflow.add_edge("quality_agent", END)

    # 5. Compile the graph into a runnable application
    return workflow.compile()

# This is the "Engine" we will call from our main backend
agent_app = build_agent_workflow()

# --- TEST THE LANGGRAPH WORKFLOW ---
if __name__ == "__main__":
    print("🤖 Testing LangGraph Multi-Agent Workflow...")
    
    # Let's pretend a Supplier Exception happened
    test_state = {
        "exception_id": 999,
        "exception_data": {
            "title": "Supplier Delay at Global Microchip Co",
            "severity": "critical"
        },
        # We simulate the Enricher adding Neo4j context
        "graph_context": {"affected_machine": "Precision Assembler A"},
        "messages": [],
        "current_agent": "",
        "recommendation": ""
    }
    
    print(f"\n🚨 Incoming Exception: {test_state['exception_data']['title']}")
    
    # Run the workflow!
    final_state = agent_app.invoke(test_state)
    
    print("\n🏁 Workflow Complete:")
    print(f"  - Agents Involved: {final_state['messages']}")
    print(f"  - Final Recommendation: {final_state['recommendation']}")