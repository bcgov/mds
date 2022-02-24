terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = ">= 2.39"
    }
    random = {
      source = "hashicorp/random"
      version = "3.1.0"
    }
  }
  backend "azurerm" {
    storage_account_name = "mdstfstate4w2tk"
    container_name       = "tfstate"
    key                  = "live.tfstate"
    resource_group_name  = "CLNPD1-ZCACN-RGP-EMLI-MDSreporting"
  }
}

provider "azurerm" {
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  skip_provider_registration = true

  features {
  }
}