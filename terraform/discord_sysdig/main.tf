terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.2.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
  # assume_role {
  #   role_arn = "arn:aws:iam::${var.target_aws_account_id}:role/BCGOV_${var.target_env}_Automation_Admin_Role"
  # }
}

resource "random_pet" "lambda_bucket_name" {
  prefix = "discord-notification-store"
  length = 4
}

resource "aws_s3_bucket" "lambda_bucket" {
  bucket = random_pet.lambda_bucket_name.id
}

resource "aws_s3_bucket_acl" "bucket_acl" {
  bucket = aws_s3_bucket.lambda_bucket.id
  acl    = "private"
}

data "archive_file" "lambda_notification" {
  type = "zip"

  source_file  = "${path.cwd}/build/notify.py"
  output_path = "${path.cwd}/build/notify.zip"
}

resource "aws_s3_object" "lambda_notification" {
  bucket = aws_s3_bucket.lambda_bucket.id

  key    = "notify.zip"
  source = data.archive_file.lambda_notification.output_path

  etag = filemd5(data.archive_file.lambda_notification.output_path)
}



resource "aws_lambda_function" "discord_notify" {
  function_name = "DiscordNotify"

  s3_bucket = aws_s3_bucket.lambda_bucket.id
  s3_key = aws_s3_object.lambda_notification.key

  runtime = "python3.9"
  handler = "notify.lambda_handler"

  source_code_hash = data.archive_file.lambda_notification.output_base64sha256
  
  role = aws_iam_role.lambda_exec.arn

}


resource "aws_cloudwatch_log_group" "discord_notify" {
  name = "/aws/lambda/${aws_lambda_function.discord_notify.function_name}-${random_pet.lambda_bucket_name.id}"

  # Do not have permissions to remove cloudwatch log groups, so this will require 
  # manual intervention for the time being. Use `terraform state rm` on this resource so
  # it will not block you from recreating this project if needed. 
  lifecycle {
    ignore_changes = [
      retention_in_days
    ]
  }
}

# AWS IAM Role for Lambda
resource "aws_iam_role" "lambda_exec" {
  name = "serverless_lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Sid    = ""
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      }
    ]
  })
}

# Attachment of IAM role to Lambda function (associates the policy with the lambda function)
resource "aws_iam_role_policy_attachment" "lambda_policy" {
  role       = aws_iam_role.lambda_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}



data "aws_lambda_invocation" "example" {
  function_name = aws_lambda_function.discord_notify.function_name

  input = <<JSON
  {
  "alert": {
    "id": 5712,
    "name": "TEST ALERT: Terraform Startup invocation",
    "description": "Alert description",
    "scope": "host_mac = \"08:00:27:70:1a:03\"",
    "severity": 4,
    "severityLabel": "Low",
    "editUrl": "",
    "subject": "TEST ALERT: Terraform Startup invocation",
    "body": "TEST ALERT: Terraform Startup invocation"
  },
  "event": {
    "id": 1680,
    "url": "https://google.ca",
    "username": "cw4886130@gmail.com"
  },
  "condition": "avg(sysdig_container_cpu_used_percent) > 85",
  "source": "Sysdig Cloud",
  "state": "ACTIVE",
  "timestamp": 1663014917135000,
  "timespan": 600000000,
  "entities": [
    {
      "entity": "host_mac = '08:00:27:70:1a:03' and container_name = 'container1_0'",
      "metricValues": [
        {
          "metric": "sysdig_container_cpu_used_percent",
          "aggregation": "avg",
          "groupAggregation": "avg",
          "value": 91.73006147775284
        }
      ]
    }
  ]
}
  JSON
}

resource "aws_apigatewayv2_api" "lambda" {
  name = "serverless_lambda_gw"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id = aws_apigatewayv2_api.lambda.id

  name = "serverless_lambda_stage"
  auto_deploy = true

    access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn

    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
      }
    )
  }
}

resource "aws_apigatewayv2_integration" "notify" {
  api_id = aws_apigatewayv2_api.lambda.id

  integration_uri = aws_lambda_function.discord_notify.invoke_arn
  integration_type = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "notify" {
  api_id = aws_apigatewayv2_api.lambda.id

  route_key = "POST /notify"
  target    = "integrations/${aws_apigatewayv2_integration.notify.id}"
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name = "/aws/api_gw/${aws_apigatewayv2_api.lambda.name}-${random_pet.lambda_bucket_name.id}"

  lifecycle {
    ignore_changes = [
      retention_in_days
    ]
  }
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.discord_notify.function_name
  principal     = "apigateway.amazonaws.com"

  source_arn = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}