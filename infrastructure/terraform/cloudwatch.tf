resource "aws_cloudwatch_log_group" "rds_logs" {
  name              = "/aws/rds/instance/tjaem-prod-db/postgresql"
  retention_in_days = 90
}

resource "aws_cloudwatch_log_group" "n8n_logs" {
  name              = "/tjaem/app/n8n"
  retention_in_days = 30
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu_alarm" {
  alarm_name          = "tjaem-rds-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "Alerta: CPU do RDS TJAEM acima de 80%"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.tjaem_db.identifier
  }
}

resource "aws_cloudwatch_metric_alarm" "rds_storage_alarm" {
  alarm_name          = "tjaem-rds-low-storage"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "1"
  metric_name         = "FreeStorageSpace"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = "5000000000" # 5GB em bytes
  alarm_description   = "Alerta: Espaço em disco do RDS TJAEM abaixo de 5GB"
  dimensions = {
    DBInstanceIdentifier = aws_db_instance.tjaem_db.identifier
  }
}
