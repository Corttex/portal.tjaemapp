resource "aws_security_group" "tjaem_ec2_sg" {
  name        = "tjaem-ec2-sg"
  description = "Security policy para EC2 (VPS) - Web e SSH"
  vpc_id      = aws_vpc.tjaem_vpc.id

  ingress {
    description = "HTTP (Web) publico"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS (Web) publico"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    description = "Acesso n8n"
    from_port   = 5678
    to_port     = 5678
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH Access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # TODO: Trocar pelo IP do escritório para segurança
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "tjaem-ec2-sg"
  }
}

resource "aws_key_pair" "tjaem_deploy_key" {
  key_name   = "tjaem-aws-key"
  public_key = file("~/.ssh/tjaem_aws_key.pub")
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical ID

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "tjaem_vps" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.tjaem_public_a.id # Public subnet for web access
  vpc_security_group_ids = [aws_security_group.tjaem_ec2_sg.id]

  # Key pair is recommended
  key_name = aws_key_pair.tjaem_deploy_key.key_name
  
  associate_public_ip_address = true # Elastic IP or dynamic public IP

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  user_data = <<-EOF
              #!/bin/bash
              apt-get update -y
              apt-get install -y docker.io docker-compose
              systemctl enable docker
              systemctl start docker
              EOF

  tags = {
    Name = "tjaem-vps-prod"
  }
}

resource "aws_eip" "tjaem_eip" {
  instance = aws_instance.tjaem_vps.id
  domain   = "vpc"

  tags = {
    Name = "TJAEM VPS IP Fixo"
  }
}

output "vps_public_ip" {
  value = aws_eip.tjaem_eip.public_ip
  description = "Aponte o subdominio portal.tjaemapp no Registro.br para este IP"
}
