import os
from neo4j import GraphDatabase

# In a real app, these should go in a .env file
# For now, replace these with the details from your credentials.txt
NEO4J_URI = "neo4j+s://579a833d.databases.neo4j.io"
NEO4J_USER = "579a833d"
NEO4J_PASSWORD = "aV5YYS0s1HE7gLhHnx9XJGRui9L1R6sdQVQfWabQ9mA"

class Neo4jClient:
    def __init__(self):
        self.driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))

    def close(self):
        self.driver.close()

    def query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return [record.data() for record in result]

# Singleton instance for use across the app
graph_db = Neo4jClient()