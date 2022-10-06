# outputs.tf

output "sns_topic" {
  value       = aws_sns_topic.billing_alert_topic.arn
  description = "Subscribe to this topic using your email to receive email alerts from the budget."
}

output "function_name" {
  description = "Name of the Lambda function."

  value = aws_lambda_function.discord_notify.function_name
}

output "base_url" {
  description = "Base URL for API Gateway stage."

  value = "${aws_apigatewayv2_stage.lambda.invoke_url}/notify"
}
