resource "aws_security_group" "tjaem_sg" {
  name        = "tjaem-app-sg"
  description = "Acesso seguro para TJAEM"
  vpc_id      = aws_vpc.tjaem_vpc.id

  # HTTPS permitido apenas de IPs autorizados (Exemplo: IP do Escritório)
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: Trocar pelo IP real do escritório para segurança máxima
  }

  # n8n webhook port (se usar auto-hosted)
  ingress {
    from_port   = 5678
    to_port     = 5678
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]  # Apenas interno
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "tjaem-app-sg" }
}
