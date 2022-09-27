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
