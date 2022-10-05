# Terragrunt Setup

[Terragrunt](https://terragrunt.gruntwork.io/)

- Move to terraform directory
- `terraform login`
- enter `yes`
- paste in the tfc secret provided by your tfc owner
- `terragrunt init`

# How env mapping works in pathfinder

- Locals will typically be set in the top-most hcl file
- Notice the funcs used for the environment key; this parses the pwd to get the closest dir name, which is usually dev/prod/test/sandbox
- So you want to `cd` to the workspace directory to "switch workspaces" i.e. be in `terraform/dev/` to apply changes to your dev workspace
- Common workspace configuration values (eg: ram) can created for access in the `terraform/config.yaml` file
- You can also provision per-workspace S3 buckets in the `terraform/config.yaml` configuration file

# Sandbox difference

Sandbox points directly to the pathfinder team's modules. it can be used to create shared services like ECR and is similar to the tools namespace of Openshift.
Note that in the case of ECR, an output will be produced showing a link to the registry.

The sandbox workspace is version controlled but currently does not have drift detected during deploys.
This is because sandbox contains business critical data. eg: If the ECR is deleted, all images are deleted.

# How terragrunt and the modules relate to the pipeline

- The AWS pipeline runs on PR and detects drift via `terragrunt` which does passthrough of to `terraform`
- `terraform` connects to `terraform cloud` and checks it's state file, which is maintained in the pathfinder team's `terraform cloud` account
- This state file is compared to current cloud resources and drift is displayed in the `plan`
- following a successful check via `terragrunt plan` (equivalent to `terraform plan`) the pipeline runs a `terragrunt apply`
- the `terragrunt apply` updates the cloud resources and state file to be equivalent based on the terraform module code.

# How to test

- `cd` to the workspace of your choice, usualy `dev` so `terraform/dev`. This will make terragrunt target the workspace based on your `pwd`
- `terragrunt plan` and then `terragrunt apply` if successful

`Note:` a successful plan does not guarantee a successful apply. Provider issues such as race conditions, or cyclical dependencies can occur, especially with security groups.

- `terragrunt state list` to fetch the list of currently provisioned cloud resources
- `terragrunt taint <state.name>` to mark a resource as faulty, it will be destroyed at next apply
- `terragrunt destroy` tear down all cloud resources in the workspace

# Tidbits

- [Terragrunt Example](https://github.com/gruntwork-io/terragrunt-infrastructure-modules-example)


# discord_sysdig_webhook - Discord Webhook service for Sysdig

discord_sysdig_webhook.tf contains the resources for the web service used to connect
Sysdig to Discord. At the time of writing, Sysdig's webhook messages are not in the 
format required for Discord's webhook API, thus, we created this service to format the 
messages properly so that we can get infrastructure monitoring and alerting to our Discord server. 

## Gotchas

The key "prod/mds/discord-webhook-link" is the webhook link for the #alerts channel in the Discord server. This secret was added manually and is required for the service to work. If it is removed, be sure to create a new secret in AWS Secrets Manager that contains a working webhook link to the #alerts or your desired text channel. 

This project is run with terragrunt using Terraform Cloud as the backend to store its state. This project is currently deployed in prod and we only need ONE copy of this. To rebuild/deploy/redeploy this project, navigate to the prod directory and run:

`terragrunt apply`

There are AWS Cloudwatch log groups attached to the lambda function and the API gateway resources for this project. If you need to check the logs on either service, login to AWS and check for their log groups or navigate to each resource and check their logs. 

To see the names of the log groups, you should be able to get the information from running:

`terragrunt show`
