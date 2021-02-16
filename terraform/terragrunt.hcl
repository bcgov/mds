locals {
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
  project          = "tnfhhm"
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
  app_image        = get_env("app_image", "")
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
app_image = "${local.app_image}"
EOF
}
