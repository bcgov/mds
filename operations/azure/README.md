# Setup

1. Install the [az CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli-linux?pivots=apt)
2. Request access to resource groups from admins (PO or tech lead)
3. Install [terraform CLI](https://www.terraform.io/downloads)

# Azure Status

Azure provides us with 2 resource groups per project:

1. A staging environment denoted by `test`
2. A non-prod final environment for the live app
   - Azure is not in `prod` status so officially we have to call this non-prod for live apps

# Interacting with Infrastructure

- Ensure the setup/ terraform was initialized correctly
- `az login`
- Run the following to set the environment:
  - `export TF_VAR_azure_tenant_id=$(az account show --query tenantId --output tsv)`
  - `export TF_VAR_azure_subscription_id=$(az account show --query id --output tsv)`
- WHILE IN `./staging/` or `./live/` run `terraform init` which downloads any plugins you might need and checks the backend state connection
- `terraform plan` does a diff between the `remote state` vs `your local tf code`
- `terraform apply` applies the detected diff of `plan` but note that a successful plan does not guarantee a successful apply - runtime errors can occur!

# First Time Deployment

- First, ensure the remote tf state storage has been correctly deployed in the resource group so that infra changes are correctly tracked - refer to [Azure Setup](./setup/README.md)
- After following the above terraform instructions: in order for the `openshift cronjob` to succeed with its restore process we need to manually seed some data into the deployed azure databases
- Run `pg_dumpall --roles-only -U postgres > /tmp/roles_super.sql` in the source database and add any needed roles (`mds`, `postgres`, `nris`) to the azure database by running the resulting sql. We need to do this manually since our postgres version is 9.6 there's a bug where roles are not included in pg_dumps and so they're not included in our backups - we need to add them separately
- Run the sql pertaining to roles `mds`, `postgres` and `nris` on the azure database while connected to `postgres`. you can connect to an azure database using your preferred DB tool. Just use the credentials exemplified in the `Connection Settings` page of the resource. Ensure your `client IP` has been added to the firewall ruleset or you will get a `ssl error` upon connection.
- With the `required roles` seeded, the `silver ip address allowed`, the restore process in the cronjob can now succeed
- The above steps are stored in an `azure-reporting` secret in the namespace for manual purposes

# Infrastructure as Code

> If infrastructure is not version controlled as code then it does not exist.

That being said, we are human and do want to support an organic/exploratory development process that appeals to this best practice. In the event infrastructure is created via the UI / CLI, make sure you import the state to the remote backend and version control matching terraform configurations
