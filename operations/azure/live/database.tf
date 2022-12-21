resource "random_string" "db_admin" {
  length  = 8
  special = false
  lower   = true
  upper   = false
  number  = false
}

resource "random_password" "db_password" {
  length  = 16
  special = true
  #override_special = "_%@"
}

resource "azurerm_postgresql_server" "mds" {
  name                = "mds-reporting-${var.environment}"
  location            = var.azure_location
  resource_group_name = var.azure_resource_group

  sku_name = "B_Gen5_2"

  storage_mb                   = 10240
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false
  auto_grow_enabled            = false

  administrator_login          = random_string.db_admin.result
  administrator_login_password = random_password.db_password.result

  version                 = "11"
  ssl_enforcement_enabled = true

  tags = {
    environment = var.environment
  }
}

resource "azurerm_postgresql_database" "mds" {
  name                = "mds"
  resource_group_name = var.azure_resource_group
  server_name         = azurerm_postgresql_server.mds.name
  charset             = "UTF8"
  collation           = "English_United States.1252"
}

# ==============================
# PostgreSQL database V13 - Core Database upgraded to 13
# =============================
resource "azurerm_postgresql_flexible_server" "mdspg13" {
  name                = "mds-reporting-pg13-${var.environment}"
  location            = var.azure_location
  resource_group_name = var.azure_resource_group

  sku_name = "B_Standard_B2s"

  storage_mb                   = 32768
  backup_retention_days        = 7
  geo_redundant_backup_enabled = false


  administrator_login    = random_string.db_admin.result
  administrator_password = random_password.db_password.result

  version = "13"
  lifecycle {
    ignore_changes = [
      # Ignore changes to tags, e.g. because a management agent
      # updates these based on some ruleset managed elsewhere.
      zone,
    ]
  }

  tags = {
    environment = var.environment
  }
}

resource "azurerm_postgresql_flexible_server_database" "mdspg13" {
  name      = "mds"
  server_id = azurerm_postgresql_flexible_server.mdspg13.id
  collation = "en_US.utf8"
  charset   = "utf8"
}
