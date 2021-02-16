# outputs.tf

output "alb_hostname" {
  value = aws_alb.main.dns_name
}

output "sns_topic" {
  value       = aws_sns_topic.billing_alert_topic.arn
  description = "Subscribe to this topic using your email to receive email alerts from the budget."
}
