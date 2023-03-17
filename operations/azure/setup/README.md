# Resource Group and CI/CD Setup

- This terraform is to be run as a one-off when starting work in a resource group.
- It creates the blob storage necessary for us to store tfstate remotely and securly.
  **ENSURE YOU ARE AUTHENTICATED WITH THE CORRECT ACCOUNT AND ARE USING THE RIGHT RESOURCE GROUP**

To create:

- Navigate to this directory
- `terraform init`
- `terraform plan`
- `terraform apply`

Grab the output of the account_name and update the storage_account_name keys of your infrastructure to match
