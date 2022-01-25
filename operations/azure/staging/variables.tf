#############################
## Deployment Variables    ##
#############################

variable "environment" {
  type        = string
  description = "Environment being deployed"
  default     = "staging"
}

variable "suffix" {
  type        = string
  description = "Environment being deployed"
  default     = "mds"
}

#############################
## Azure Variables         ##
#############################
variable "azure_subscription_id" {
  type        = string
  description = "The Azure 'subscription id'"
}
variable "azure_tenant_id" {
  type        = string
  description = "The Azure 'tenant id'"
}

variable "azure_resource_group" {
  type        = string
  description = "Azure resource group"
  default     = "CLNPD1-ZCACN-RGP-EMLI-MDSreporting-Test"
}

variable "azure_location" {
  type        = string
  description = "Azure resource group"
  default     = "canadacentral"
}