import os
from neo4j import GraphDatabase

# In a real app, these should go in a .env file
# For now, replace these with the details from your credentials.txt
NEO4J_URI = "neo4j+s://4327b0bb.databases.neo4j.io"
NEO4J_USER = "neo4j"
NEO4J_PASSWORD = "B0v4DQVZYc5RZDrDLbJO44s1I1_2A47raYoZGB1C3YE"

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