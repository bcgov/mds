# Terragrunt Setup

- Move to terraform directory

- `terraform login`

- enter `yes`

- paste in the tfc secret provided by your tfc owner

- `terragrunt init`

## Local TF Usage

### How env mapping works in pathfinder

Locals will typically be set in the top-most hcl file
`locals { tfc_hostname = "app.terraform.io" tfc_organization = "bcgov" project = "bth36g" environment = reverse(split("/", get_terragrunt_dir()))[0] app_image = get_env("app_image", "") }`

notice the funcs used for the environment key; this parses the pwd to get the closest dir name, which is usually dev/prod/test/sandbox

So you want to `cd` to the workspace directory to "switch workspaces"

### Sandbox difference

Sandbox points directly to the pathfinder team's modules
it can be used to create shared services like ECR
Note that in the case of ECR, an output will be produced showing a link to the registry

## How terragrunt and the modules relate to the pipeline

## Tidbits

### Sample repo

https://github.com/gruntwork-io/terragrunt-infrastructure-modules-example

## Possible secrets management for workspaces

https://github.com/awslabs/tecli
