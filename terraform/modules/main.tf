terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
    sysdig = {
      source  = "sysdiglabs/sysdig"
      version = "0.5.40"
    }
  }
}

provider "aws" {
  region = var.aws_region
  assume_role {
    role_arn = "arn:aws:iam::${var.target_aws_account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role"
  }
}

provider "sysdig" {
  sysdig_monitor_api_token = data.aws_secretsmanager_secret_version.sysdig_monitor_token.secret_id
}

locals {
  common_tags        = var.common_tags
}
