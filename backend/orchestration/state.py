from typing import TypedDict, List, Annotated
import operator

# This is the "Clipboard" that agents pass to each other.
# As it moves through the graph, agents add their notes to it.
class AgentState(TypedDict):
    exception_id: int           # The ID from your SQLite database
    exception_data: dict        # The title, severity, node, etc.
    graph_context: dict         # The "Blast Radius" from Neo4j!
    messages: Annotated[List[str], operator.add] # Log of what agents are saying
    current_agent: str          # Who is holding the clipboard right now?
    recommendation: str         # The final solution