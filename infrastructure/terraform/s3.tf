resource "aws_s3_bucket" "tjaem_docs" {
  bucket = "tjaem-central-arquivos-prod"
  tags   = { Name = "Central de Arquivos TJAEM" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tjaem_docs_encryption" {
  bucket = aws_s3_bucket.tjaem_docs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tjaem_docs_block" {
  bucket = aws_s3_bucket.tjaem_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
