# security.tf

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "web" {
  name = "Web_sg"
}

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "data" {
  name = "Data_sg"
}

# ALB Security Group: Edit to restrict access to the application
data "aws_security_group" "app" {
  name = "App_sg"
}

# Used in sg names so that 2 named groups from same resource may exist at once before destroying one
resource "random_id" "unique" {
  byte_length = 8
}