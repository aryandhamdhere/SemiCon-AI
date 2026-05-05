// Demo data used when the backend is unreachable (e.g., Vercel deployment)
export const DEMO_EXCEPTIONS = [
  {
    id: 1,
    title: 'Cooling System Failure on EUV Stepper',
    description: 'Coolant pressure dropped below critical threshold on MAC_ASML_1. Immediate risk of thermal expansion, lens distortion, and wafer misalignment.',
    node: 'MAC_ASML_1',
    severity: 'critical',
    status: 'pending',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Photoresist Contamination Detected',
    description: 'Batch of photoresist chemical from SUP_CHEM shows particulate contamination exceeding 15nm. Risk of short circuits on logic wafers.',
    node: 'SUP_CHEM',
    severity: 'high',
    status: 'pending',
    created_at: new Date(Date.now() - 300000).toISOString()
  },
  {
    id: 3,
    title: 'Pressure Spikes in CVD Reactor',
    description: 'Precursor gas flow from SUP_GAS fluctuating wildly in MAC_CVD_1, leading to uneven deposition layers on 3D NAND wafers.',
    node: 'MAC_CVD_1',
    severity: 'medium',
    status: 'escalated',
    created_at: new Date(Date.now() - 600000).toISOString()
  }
];

export const DEMO_AGENT_LOGS = [
  { agent: 'Orchestrator', message: 'Received EX-1: Routing to Quality Agent (machine failure detected)' },
  { agent: 'Quality Agent', message: 'Correlating MAC_ASML_1 sensor data with historical defect rates...' },
  { agent: 'Quality Agent', message: 'Querying Gemini 2.0 Flash for maintenance protocols...' },
  { agent: 'Supply Agent', message: 'Analyzing SUP_CHEM contamination — tracing downstream SKU impact via Neo4j...' },
  { agent: 'Supply Agent', message: 'Strategic recommendation formed: switch to backup photoresist supplier.' },
  { agent: 'Orchestrator', message: 'Received EX-3: Routing to Quality Agent (CVD pressure anomaly)' },
  { agent: 'Quality Agent', message: 'Maintenance ticket generated for CVD reactor stabilization.' },
];

export const DEMO_EXCEPTION_DETAIL = {
  exception: {
    id: 1,
    title: 'Cooling System Failure on EUV Stepper',
    description: 'Coolant pressure dropped below critical threshold on MAC_ASML_1. Immediate risk of thermal expansion, lens distortion, and wafer misalignment. The EUV lithography stepper is the most critical and expensive machine in the fab ($150M). Without proper cooling, the extreme ultraviolet light source causes thermal expansion in the optical column, leading to overlay errors on every wafer.',
    node: 'MAC_ASML_1',
    severity: 'critical',
    status: 'pending',
    created_at: new Date().toISOString()
  },
  actions: [{
    agent_name: 'Quality Agent',
    recommendation: 'Immediately halt MAC_ASML_1 and switch to backup cooling loop B. Dispatch maintenance crew to inspect primary coolant pump seals and replace thermal interface material on the EUV source collector. Reroute in-progress wafer lots (Lot #W2024-887, #W2024-892) to MAC_ASML_2 standby stepper to maintain H100 chip production targets. Estimated downtime: 4-6 hours.',
    confidence: 0.94
  }],
  impact: '⚠️ Fabrication Alert: Tool failure at MAC_ASML_1 directly affects the production of 2 SKUs (e.g., H100 Tensor Core AI Chip). Immediate rerouting or Wafer lot scrapping is required.'
};
