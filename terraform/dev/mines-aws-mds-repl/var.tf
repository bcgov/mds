variable "subnets" {
  type        = list(string)
  description = "List of Subnets"    
  default     = ["subnet-963106fe", "subnet-b6db9bcc", "subnet-734e832c"]
}
variable "environment" {
  description = "Environment like dev, staging, prod"
  default     = "Dev"
}

variable "source_engine" {
  description = "Database engine to migrate"
  default     = "postgres"
}
variable "source_database_host" {
  description = "Database host to migrate"
  default     = "mdspostgres.canadacentral.cloudapp.azure.com"
}
variable "source_database_name" {
  description = "Source database"
  default     = "mds"
}
variable "source_database_username" {
  description = "Source database user"
  default     = "yasserhu"
}
variable "source_database_password" {
  description = "Source database password"
  sensitive   = true
  default     = "Dragon2010))"
}
variable "source_port" {
 description = "Source database port"
 default     = "5432"
}

variable "application" {
  description = "Client application"
  default = "mds-mines"
}

variable "client" {
  description = "Client name"
  default = "Mines"
}
variable "target_engine" {
  description = "Target database engine"
  default     = "postgres"
}
variable "connection_attributes" {
  description = "Connection attributes"
  default     = null
}
variable "target_database_host" {
  description = "Target database host"
  default     = "mds-replication.cgcpovgwzjyv.us-east-2.rds.amazonaws.com"
}
variable "target_database_name" {
  description = "Target database name"
  default     = "mds"
}
variable "target_database_username" {
  description = "Target database user"
  default     = "postgres"
}
variable "target_database_password" {
  description = "Target database password"
  sensitive   = true
  default     = "Dragon2010))"
}
variable "target_port" {
  description = "Target database port"
  default     = "5432"
}
variable "ssl_mode" {
  description = "Enable SSL encryption"
  default     = "require"
}

variable "storage_size" {
  description = "Replication task storage"
  default     = 50
}
variable "dms_engine_version" {
  description = "Data migration service engine version"
  default     = "3.4.5"
}
variable "publicly_accessible" {
  description = "True if you want DMS instance to be accessible publicly"
  default     = true

}
variable "instance_type" {
  description = "Migration instance type"
  default     = "dms.t3.medium"
}