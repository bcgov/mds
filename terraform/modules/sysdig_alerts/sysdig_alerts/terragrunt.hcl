terraform {
  source = "./../modules/"
}

include {
  path = find_in_parent_folders()
}