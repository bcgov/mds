# variables.tf

variable "slug" {
  description = "acronym of project"
  default = "mds"
}

variable "repository_name" {
  description = "Name for the container repository to be provisioned."
  type        = string
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

variable "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  default     = "mdsEcsTaskExecutionRole"
}

variable "ecs_auto_scale_role_name" {
  description = "ECS auto scale role Name"
  default     = "mdsEcsAutoScaleRole"
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "app_name" {
  description = "Name of the application"
  type        = string
  default     = "minesdigitalservices"
}

variable "app_image" {
  description = "Docker image to run in the ECS cluster. _Note_: there is a blank default value, which will cause service and task resource creation to be supressed unless an image is specified."
  type        = string
  default     = ""
}

variable "app_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 3000
}

variable "app_count" {
  description = "Number of docker containers to run"
  default     = 2
}

variable "container_name" {
  description = "Container name"
  default     = "app"
}

variable "health_check_path" {
  default = "/"
}

variable "fargate_cpu" {
  description = "Fargate instance CPU units to provision (1 vCPU = 1024 CPU units)"
  default     = 512
}

variable "fargate_memory" {
  description = "Fargate instance memory to provision (in MiB)"
  default     = 1024
}

variable "budget_amount" {
  description = "The amount of spend for the budget. Example: enter 100 to represent $100"
  default     = "100.0"
}

variable "budget_tag" {
  description = "The Cost Allocation Tag that will be used to build the monthly budget. "
  default     = "Project=MDS Frontend Spike"
}

variable "alb_cert_domain" {
  description = "The domain of cert to use for the internal ALB"
  default     = "*.example.ca"
}

variable "common_tags" {
  description = "Common tags for created resources"
  default = {
    Application = "MDS Spike"
  }
}
