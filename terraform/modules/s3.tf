resource "aws_s3_bucket" "this" {
  for_each = toset(var.storage_buckets)
  bucket   = each.key
  acl      = "private"

  tags = local.common_tags
}