variable "db_password" {
  description = "Senha do banco de dados RDS"
  type        = string
  sensitive   = true
}

resource "aws_db_instance" "tjaem_db" {
  identifier           = "tjaem-prod-db"
  engine               = "postgres"
  engine_version       = "15.10"
  instance_class       = "db.t3.micro"
  allocated_storage    = 20
  username             = "tjaem_admin"
  password             = var.db_password
  
  # Segurança e Criptografia
  storage_encrypted     = true
  kms_key_id            = aws_kms_key.tjaem_kms_key.arn
  vpc_security_group_ids = [aws_security_group.tjaem_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.tjaem_subnet.name
  
  # Performance e Monitoramento
  performance_insights_enabled = true
  monitoring_interval           = 60
  monitoring_role_arn           = aws_iam_role.rds_monitoring_role.arn
  
  # Backups e Manutenção
  backup_retention_period = 0
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"
  
  skip_final_snapshot    = false
  final_snapshot_identifier = "tjaem-final-snapshot"
  
  tags = { Name = "TJAEM Database" }
}

resource "aws_db_subnet_group" "tjaem_subnet" {
  name       = "tjaem-db-subnet"
  subnet_ids = [aws_subnet.tjaem_private_a.id, aws_subnet.tjaem_private_b.id]
}

# Role para monitoramento aprimorado
resource "aws_iam_role" "rds_monitoring_role" {
  name = "rds-monitoring-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "monitoring.rds.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "rds_monitoring_policy" {
  role       = aws_iam_role.rds_monitoring_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

output "rds_endpoint" {
  value = aws_db_instance.tjaem_db.endpoint
}
