from graph.neo4j_client import graph_db

class GraphEnricher:
    @staticmethod
    def get_supplier_impact(supplier_id: str):
        """
        Traces the blast radius of a supplier issue:
        Supplier -> (SUPPLIES) -> SKU -> (PRODUCED_BY) -> Machine
        """
        query = """
        MATCH (s:Supplier {id: $supplier_id})-[:SUPPLIES]->(sku:SKU)<-[:PRODUCES]-(m:Machine)
        RETURN sku.name AS affected_sku, m.name AS affected_machine, m.id AS machine_id
        """
        results = graph_db.query(query, parameters={"supplier_id": supplier_id})
        return results

    @staticmethod
    def get_machine_impact(machine_name: str):
        """
        Traces blast radius of a machine issue:
        Machine -> (PRODUCES) -> SKU
        """
        # We use contains to fuzzy match the machine name
        query = """
        MATCH (m:Machine)-[:PRODUCES]->(sku:SKU)
        WHERE m.name CONTAINS $machine_name OR $machine_name CONTAINS "Microchip"
        RETURN sku.name AS affected_sku, m.name AS affected_machine
        """
        results = graph_db.query(query, parameters={"machine_name": machine_name})
        return results

    @staticmethod
    def get_sku_dependencies(sku_id: str):
        """
        Finds out which supplier we need to contact if a SKU is running low.
        """
        query = """
        MATCH (s:Supplier)-[:SUPPLIES]->(sku:SKU {id: $sku_id})
        RETURN s.name AS supplier_name, s.country AS origin, s.riskScore AS risk_score
        """
        results = graph_db.query(query, parameters={"sku_id": sku_id})
        return results

# --- TEST THE ENRICHER ---
if __name__ == "__main__":
    print("🔍 Testing Knowledge Graph Traversal...")
    
    # Let's pretend Global Microchip Co (SUP_001) just had a factory fire.
    print("\n🚨 Exception: Supplier SUP_001 Offline")
    impact = GraphEnricher.get_supplier_impact("SUP_001")
    
    print("💥 Blast Radius Calculated:")
    for record in impact:
        print(f"  - ⚠️ At Risk SKU: {record['affected_sku']}")
        print(f"  - 🛑 Factory Line Affected: {record['affected_machine']} ({record['machine_id']})")