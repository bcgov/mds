# variables.tf

variable "slug" {
  description = "acronym of project"
  default     = "mds"
}

variable "target_env" {
  description = "AWS workload account env (e.g. dev, test, prod, sandbox, unclass)"
}

variable "target_aws_account_id" {
  description = "AWS workload account id"
}

variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "ca-central-1"
}

variable "budget_amount" {
  description = "The amount of spend for the budget. Example: enter 100 to represent $100"
  default     = "600.0"
}

variable "budget_tag" {
  description = "The Cost Allocation Tag that will be used to build the monthly budget. "
  default     = "Project=MDS Frontend Spike"
}

variable "common_tags" {
  description = "Common tags for created resources"
  default = {
    Application = "MDS"
  }
}

variable "service_names" {
  description = "List of service names to use as subdomains"
  default     = ["minesdigitalservices"]
  type        = list(string)
}

variable "configs" {
  description = "Contains a mapping of service configurations"
}

variable "storage_buckets" {
  description = "Contains a list of s3 buckets for this workspace"
}

## Sysdig ##

data "aws_secretsmanager_secret" "secrets" {
  arn = "arn:aws:secretsmanager:ca-central-1:786397676156:secret:prod/mds/sysdig_monitor_api_token-rU7REF"
}

data "aws_secretsmanager_secret_version" "creds" {
  # Fill in the name you gave to your secret
  secret_id = data.aws_secretsmanager_secret.secrets.id
}