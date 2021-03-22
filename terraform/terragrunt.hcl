locals {
  common           = yamldecode(file(find_in_parent_folders("common.yaml")))
  tfc_hostname     = local.common["tfc_hostname"]
  tfc_organization = local.common["tfc_organization"]
  project          = local.common["license_plate"]
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
  ecr_arn          = get_env("ECR_ARN", "")
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

generate "tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
ecr_arn = "${local.ecr_arn}"
EOF
}
