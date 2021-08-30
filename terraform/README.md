# Terragrunt Setup

- Move to terraform directory
- `terraform login`
- enter `yes`
- paste in the tfc secret provided by your tfc owner
- `terragrunt init`

### How env mapping works in pathfinder

- Locals will typically be set in the top-most hcl file
- Notice the funcs used for the environment key; this parses the pwd to get the closest dir name, which is usually dev/prod/test/sandbox
- So you want to `cd` to the workspace directory to "switch workspaces" i.e. be in `terraform/dev/` to apply changes to your dev workspace
- Common workspace configuration values (eg: ram) can created for access in the `terraform/config.yaml` file
- You can also provision per-workspace S3 buckets in the `terraform/config.yaml` configuration file

### Sandbox difference

Sandbox points directly to the pathfinder team's modules. it can be used to create shared services like ECR.
Note that in the case of ECR, an output will be produced showing a link to the registry.

The sandbox workspace is version controlled but currently does not have drift detected during deploys.
This is because sandbox contains business critical data. eg: If the ECR is deleted, all images are deleted.

## How terragrunt and the modules relate to the pipeline

- The AWS pipeline runs on PR and detects drift via `terragrunt` which does passthrough of to `terraform`
- `terraform` connects to `terraform cloud` and checks it's state file, which is maintained in the pathfinder team's `terraform cloud` account
- This state file is compared to current cloud resources and drift is displayed in the `plan`
- following a successful check via `terragrunt plan` (equivalent to `terraform plan`) the pipeline runs a `terragrunt apply`
- the `terragrunt apply` updates the cloud resources and state file to be equivalent based on the terraform module code.

## Tidbits

https://github.com/gruntwork-io/terragrunt-infrastructure-modules-example
