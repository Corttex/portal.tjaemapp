resource "aws_kms_key" "tjaem_kms_key" {
  description             = "Chave Mestra TJAEM para criptografia de RDS e S3"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  tags = {
    Name = "TJAEM Master Key"
  }
}

resource "aws_kms_alias" "tjaem_kms_alias" {
  name          = "alias/tjaem-master-key"
  target_key_id = aws_kms_key.tjaem_kms_key.key_id
}
