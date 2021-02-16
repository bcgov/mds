terraform {
  source = "${get_terragrunt_dir()}/../modules/"
}

include {
  path = find_in_parent_folders()
}