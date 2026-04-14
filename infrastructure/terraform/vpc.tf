resource "aws_vpc" "tjaem_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "tjaem-prod-vpc" }
}

resource "aws_subnet" "tjaem_private_a" {
  vpc_id            = aws_vpc.tjaem_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "sa-east-1a"
  tags = { Name = "tjaem-private-a" }
}

resource "aws_subnet" "tjaem_private_b" {
  vpc_id            = aws_vpc.tjaem_vpc.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "sa-east-1b"
  tags = { Name = "tjaem-private-b" }
}

# VPC Flow Logs para auditoria de rede
resource "aws_flow_log" "tjaem_vpc_flow_log" {
  iam_role_arn    = aws_iam_role.vpc_flow_log_role.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_log_group.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.tjaem_vpc.id
}

resource "aws_cloudwatch_log_group" "vpc_flow_log_group" {
  name              = "/aws/vpc/tjaem-flow-logs"
  retention_in_days = 30
}

resource "aws_iam_role" "vpc_flow_log_role" {
  name = "vpc-flow-log-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "vpc-flow-logs.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "vpc_flow_log_policy" {
  name = "vpc-flow-log-policy"
  role = aws_iam_role.vpc_flow_log_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ]
      Effect   = "Allow"
      Resource = "*"
    }]
  })
}
