terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "=2.46.0"
    }
    random = {
      source = "hashicorp/random"
      version = "3.1.0"
    }
  }
}

provider "azurerm" {
  skip_provider_registration = true
  features {}
}

provider "random" {
}

resource "random_string" "resource_code" {
  length  = 5
  special = false
  upper   = false
}

resource "azurerm_storage_account" "tfstate" {
  name                     = "mdstfstate${random_string.resource_code.result}"
  resource_group_name      = "CLNPD1-ZCACN-RGP-EMLI-MDSreporting"
  location                 = "canadacentral"
  account_tier             = "Standard"
  account_replication_type = "LRS"
  allow_blob_public_access = true
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_name  = azurerm_storage_account.tfstate.name
  container_access_type = "private"
}

output "account_name" {
  value       = azurerm_storage_account.tfstate.name
  description = "Name of tfstate blob storage account."
}