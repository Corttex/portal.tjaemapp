terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket = "tjaem-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "sa-east-1"
    encrypt = true
  }
}

provider "aws" {
  region = "sa-east-1"
}
