terraform {
  source = "git::https://github.com/bcgov/startup-sample-project-terraform-modules.git//?ref=v0.0.1"
}

include {
    path = find_in_parent_folders()
}
