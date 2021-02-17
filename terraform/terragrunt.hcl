locals {
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
  project          = "bth36g"
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
  app_image        = get_env("app_image", "")
}

generate "tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
app_image = "${local.app_image}"
EOF
}
