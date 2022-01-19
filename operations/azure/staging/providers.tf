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
    storage_account_name = "mdstfstatekftot"
    container_name       = "tfstate"
    key                  = "staging.tfstate"
    resource_group_name  = "CLNPD1-ZCACN-RGP-EMLI-MDSreporting-Test"
  }
}

provider "azurerm" {
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
  skip_provider_registration = true

  features {
  }
}