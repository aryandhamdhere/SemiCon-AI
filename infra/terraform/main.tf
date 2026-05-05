provider "aws" {
  region = "us-east-1"
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "supply-chain-ai-cluster"
}

# RDS Postgres Database for Audit Logs
resource "aws_db_instance" "audit_db" {
  allocated_storage    = 20
  engine               = "postgres"
  engine_version       = "14"
  instance_class       = "db.t3.micro"
  name                 = "auditdb"
  username             = "admin"
  password             = var.db_password
  skip_final_snapshot  = true
}

# ECS Task Definition
resource "aws_ecs_task_definition" "backend" {
  family                   = "supply-chain-backend"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256
  memory                   = 512

  container_definitions = jsonencode([{
    name      = "backend"
    image     = "myregistry/supply-chain-ai-backend:latest"
    essential = true
    portMappings = [{
      containerPort = 8000
      hostPort      = 8000
    }]
    environment = [
      { name = "NEO4J_URI", value = var.neo4j_uri },
      { name = "DATABASE_URL", value = aws_db_instance.audit_db.endpoint }
    ]
  }])
}
