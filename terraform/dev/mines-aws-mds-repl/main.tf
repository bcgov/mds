resource "random_id" "id" {
  byte_length = 8
}

resource "aws_dms_replication_subnet_group" "replication-subnet-group" {
  replication_subnet_group_description = "Replication subnet group for ${var.application}"
  replication_subnet_group_id          = "dms-subnet-group-${random_id.id.hex}"

  subnet_ids = var.subnets

  tags = {
    Name        = "${var.client} DMS subnet group"
    Description = "Managed by NTTData"
    Env         = var.environment
    Owner       = var.client
  }
}


resource "aws_dms_replication_instance" "replication-instance" {
  allocated_storage           = var.storage_size
  apply_immediately           = true
  auto_minor_version_upgrade  = true
  engine_version              = var.dms_engine_version
  publicly_accessible         = var.publicly_accessible
  replication_instance_class  = var.instance_type
  replication_instance_id     = "dms-replication-instance-${random_id.id.hex}"
  replication_subnet_group_id = "${aws_dms_replication_subnet_group.replication-subnet-group.id}"

  tags = {
    Name        = "${var.client} Replication Instance"
    Description = "Managed by NTTData"
    Env         = var.environment
    Application = var.application
    Owner       = var.client
  }
}