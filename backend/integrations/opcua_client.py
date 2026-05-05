import logging

logger = logging.getLogger(__name__)

class OPCUAClient:
    """Stub for MES / Machine Integration via OPC-UA."""
    
    def __init__(self, server_url: str):
        self.server_url = server_url
        logger.info(f"Initialized OPC-UA Client pointing to {server_url}")

    def read_machine_oee(self, machine_id: str) -> float:
        """Reads Overall Equipment Effectiveness from a CNC machine."""
        logger.info(f"Reading OEE for machine {machine_id}...")
        # Mock logic based on machine ID
        if "LINE_1" in machine_id:
            return 0.65 # Under-performing
        return 0.92

    def subscribe_to_vibration_alerts(self, callback):
        """Simulates subscribing to real-time machine telemetry."""
        logger.info("Subscribed to MQTT/OPC-UA vibration streams.")
        # callback({"machine_id": "MAC_1", "vibration": 14.5})

opcua_client = OPCUAClient("opc.tcp://factory-floor.internal:4840")
