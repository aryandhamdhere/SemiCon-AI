import json
import random

def call_llm(system_prompt: str, exception_data: dict) -> dict:
    """
    MOCK LLM: This fakes an AI response so we can test the system without an API key.
    """
    print(f"🤖 Mock AI is analyzing exception: {exception_data.get('title')}")
    
    # We simulate a slight "thinking" delay, but since it's mock, it's instant here.
    
    # Return a fake JSON response that perfectly matches the schema required by the PDF
    mock_response = {
        "rootCause": f"Simulated Root Cause for {exception_data.get('node', 'Unknown Node')}",
        "severity": exception_data.get('severity', 'high'),
        "confidence": round(random.uniform(0.75, 0.98), 2),
        "recommendedActions": [
            "Reroute shipment via secondary logistics partner.",
            "Alert local warehouse manager."
        ],
        "estimatedImpact": "Potential delay of 24-48 hours.",
        "requiresHumanApproval": True,
        "escalateTo": "Supply Chain Director" if exception_data.get('severity') == 'critical' else None
    }
    
    return mock_response