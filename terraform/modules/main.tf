provider "aws" {
  region  = var.aws_region
  version = "~> 3.11"

  assume_role {
    role_arn = "arn:aws:iam::${var.target_aws_account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role"
  }
}

locals {
  common_tags        = var.common_tags
  create_ecs_service = var.app_image == "" ? 0 : 1
}
