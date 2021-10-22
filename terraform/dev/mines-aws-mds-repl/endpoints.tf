resource "aws_dms_endpoint" "source" {
  endpoint_id                 = "dms-source-endpoint-${random_id.id.hex}"
  endpoint_type               = "source"
  engine_name                 = var.source_engine
  extra_connection_attributes = var.connection_attributes
  server_name                 = var.source_database_host
  database_name               = var.source_database_name
  username                    = var.source_database_username
  password                    = var.source_database_password
  port                        = var.source_port
  ssl_mode                    = var.ssl_mode

  tags = {
    Name        = "${var.client} Source Endpoint"
    Description = "Managed by NTTData"
    Application = "${var.application}"
    Owner       = var.client
    Env         = var.environment
  }
}


resource "aws_dms_endpoint" "target" {
  endpoint_id                 = "dms-target-endpoint-${random_id.id.hex}"
  endpoint_type               = "target"
  engine_name                 = var.target_engine
  extra_connection_attributes = var.connection_attributes
  server_name                 = var.target_database_host
  database_name               = var.target_database_name
  username                    = var.target_database_username
  password                    = var.target_database_password
  port                        = var.target_port
  ssl_mode                    = var.ssl_mode

  tags = {
    Name        = "${var.client} Target Endpoint"
    Description = "Managed by NTTData"
    Application = var.application
    Env         = var.environment
    Owner       = var.client
  }
}