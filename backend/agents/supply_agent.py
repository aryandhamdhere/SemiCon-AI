from agents.base_agent import call_llm

def process_supply_exception(exception_data: dict) -> dict:
    # This is the system prompt template from your Build Planner
    system_prompt = """
    You are the Supply Logistics Agent for an enterprise manufacturing platform.
    You receive exception events in JSON format.
    You must respond ONLY with valid JSON.
    JSON schema: { rootCause: string, severity: 'critical' | 'high' | 'medium', confidence: float 0-1, recommendedActions: string[], estimatedImpact: string, requiresHumanApproval: boolean, escalateTo: string | null }
    Base your analysis on the exception context, affected SKUs, and timing patterns.
    """
    
    # Send the prompt and the data to our mock LLM
    ai_recommendation = call_llm(system_prompt, exception_data)
    
    return ai_recommendation