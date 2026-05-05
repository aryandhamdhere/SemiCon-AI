from neo4j_client import graph_db

def seed_knowledge_graph():
    print("🌱 Seeding Knowledge Graph...")
    
    # 1. Clear existing data (Be careful with this in production!)
    graph_db.query("MATCH (n) DETACH DELETE n")

    # 2. Create Suppliers, SKUs, and Machines
    # This follows the schema on Page 1 of your Beta 3 PDF
    cypher_setup = """
    // Create Suppliers
    CREATE (s1:Supplier {id: 'SUP_WAF', name: 'Global Wafers Ltd', country: 'Taiwan', riskScore: 0.15})
    CREATE (s2:Supplier {id: 'SUP_CHEM', name: 'Tokyo Ohka Kogyo', country: 'Japan', riskScore: 0.05})
    CREATE (s3:Supplier {id: 'SUP_GAS', name: 'Air Liquide', country: 'France', riskScore: 0.1})
    
    // Create Machines (The Fab)
    CREATE (m1:Machine {id: 'MAC_ASML_1', name: 'Photolithography Stepper (EUV)', status: 'active', oeeTarget: 0.95})
    CREATE (m2:Machine {id: 'MAC_ETCH_1', name: 'Plasma Etching Chamber', status: 'active', oeeTarget: 0.92})
    CREATE (m3:Machine {id: 'MAC_CVD_1', name: 'Chemical Vapor Deposition Reactor', status: 'active', oeeTarget: 0.90})
    CREATE (m4:Machine {id: 'MAC_CMP_1', name: 'Chemical Mechanical Polisher', status: 'active', oeeTarget: 0.88})

    // Create SKUs
    CREATE (sku1:SKU {id: 'SKU_H100', name: 'H100 Tensor Core AI Chip', category: 'Semiconductor Logic', safetyStock: 50})
    CREATE (sku2:SKU {id: 'SKU_NAND', name: '256-Layer 3D NAND Flash', category: 'Semiconductor Memory', safetyStock: 500})
    
    // Create Relationships (The Process Flow)
    // 1. Suppliers feed the first machines
    MERGE (s1)-[:SUPPLIES]->(m1)
    MERGE (s2)-[:SUPPLIES]->(m1)
    MERGE (s3)-[:SUPPLIES]->(m3)
    
    // 2. Sequential Machine Process
    MERGE (m1)-[:FEEDS_INTO]->(m2)
    MERGE (m2)-[:FEEDS_INTO]->(m3)
    MERGE (m3)-[:FEEDS_INTO]->(m4)
    
    // 3. Final Production to SKU
    MERGE (m4)-[:PRODUCES]->(sku1)
    MERGE (m4)-[:PRODUCES]->(sku2)
    """
    
    try:
        graph_db.query(cypher_setup)
        print("✅ Graph seeding complete! 50+ relationship paths established.")
    except Exception as e:
        print(f"❌ Error seeding graph: {e}")

if __name__ == "__main__":
    seed_knowledge_graph()