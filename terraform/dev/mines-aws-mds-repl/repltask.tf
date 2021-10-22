resource "aws_dms_replication_task" "replication-task" {
  migration_type           = "full-load-and-cdc"
  replication_instance_arn = aws_dms_replication_instance.replication-instance.replication_instance_arn
  replication_task_id      = "dms-replication-task-${random_id.id.hex}"

  source_endpoint_arn = aws_dms_endpoint.source.endpoint_arn
  target_endpoint_arn = aws_dms_endpoint.target.endpoint_arn

  table_mappings            = trimspace(file("table_mapping.json"))
  replication_task_settings = trimspace(file("rep_task_settings.json"))

  tags = {
    Name        = "${var.client} Replication Task"
    Owner       = var.client
    Application = var.application
    Description = "Managed by NTTData"
    Env         = var.environment
  }
}