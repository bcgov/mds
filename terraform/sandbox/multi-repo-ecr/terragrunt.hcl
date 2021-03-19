terraform {
  source = "git::https://github.com/BCDevOps/terraform-octk-aws-workload-ecr.git//.?ref=v0.0.2"
}

locals {
  common           = yamldecode(file(find_in_parent_folders("common.yaml")))
  tfc_hostname     = local.common["tfc_hostname"]
  tfc_organization = local.common["tfc_organization"]
  project          = local.common["license_plate"]
  ecrs             = local.common["ecrs"]
  environment      = reverse(split("/", get_terragrunt_dir()))[1] # pattern: mds-*, multi-repo-ecr, sandbox
  read_principals  = get_env("AWS_ACCOUNTS_ECR_READ_ACCESS", "")
}

generate "tfvars" {
  path              = "terragrunt.${local.environment}.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
repository_names = ["${join("\", \"", local.ecrs)}"]
read_principals = ${local.read_principals}
EOF
}

generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "remote" {
    hostname = "${local.tfc_hostname}"
    organization = "${local.tfc_organization}"
    workspaces {
      name = "${local.project}-${local.environment}"
    }
  }
}
EOF
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region  = var.aws_region

  assume_role {
    role_arn = "arn:aws:iam::$${var.target_aws_account_id}:role/BCGOV_$${var.target_env}_Automation_Admin_Role"
  }
}
EOF
}
