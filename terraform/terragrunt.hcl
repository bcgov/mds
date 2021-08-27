locals {
  common           = yamldecode(file(find_in_parent_folders("configs.yaml")))
  tfc_hostname     = local.common["tfc_hostname"]
  tfc_organization = local.common["tfc_organization"]
  project          = local.common["license_plate"]
  service_name     = local.common["service_name"]
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
  configs          = local.common["configs"][local.environment]
  storage_buckets  = local.common["storage_buckets"][local.environment]
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
service_names = ["${local.service_name}"]
configs = ${jsonencode(local.configs)}
storage_buckets = ${jsonencode(local.storage_buckets)}
EOF
}
