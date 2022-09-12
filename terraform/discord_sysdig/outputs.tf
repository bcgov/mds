output "function_name" {
  description = "Name of the Lambda function."

  value = aws_lambda_function.discord_notify.function_name
}

# output "result_entry" {
#   value = jsondecode(data.aws_lambda_invocation.example.result)["alert"]
# }