import httpx

# Replace this with your actual Slack Webhook URL later
SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/WEBHOOK/HERE"

async def send_slack_notification(message: str):
    payload = {"text": message}
    try:
        async with httpx.AsyncClient() as client:
            # We use httpx as recommended in your dependencies
            response = await client.post(SLACK_WEBHOOK_URL, json=payload)
            return response.status_code == 200
    except Exception as e:
        print(f"❌ Failed to send Slack alert: {e}")
        return False