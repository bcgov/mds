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

  # Do not currently have permissions (as of Sept 9th, 2022) to set retention policy.
  # Appears to default to 2 years. 

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



# data "aws_lambda_invocation" "example" {
#   function_name = aws_lambda_function.lambda_function_test.function_name

#   input = <<JSON
#   {
#   "alert": {
#     "id": 5712,
#     "name": "TEST ALERT: Testing Notification Channel Rocketchat-alert-channel-MDS",
#     "description": "Alert description",
#     "scope": "host_mac = \"08:00:27:70:1a:03\"",
#     "severity": 4,
#     "severityLabel": "Low",
#     "editUrl": "https://app.sysdigcloud.com/#/alerts/5712",
#     "subject": "TEST ALERT: Testing Notification Channel Rocketchat-alert-channel-MDS",
#     "body": "TEST ALERT: Testing Notification Channel Rocketchat-alert-channel-MDS\n\n\nEvent Generated:\n\nSeverity:         Low\nMetric:\n    sysdig_container_cpu_used_percent = 91.7301 %\nSegment:\n    container_name = 'container1_0' and host_mac = '08:00:27:70:1a:03'\nScope:\n    host_hostname = 'Host-0 (08:00:27:70:1a:03)'\n\nTime:             09/12/2022 08:35 PM UTC\nState:            Triggered\nNotification URL: https://app.sysdigcloud.com/#/events/notifications/l:2419200/1680/details\n\n------\n\nTriggered by Alert:\n\nName:         TEST ALERT: Testing Notification Channel Rocketchat-alert-channel-MDS\nDescription:  Alert description\nTeam:         Catchall\nScope:\n    host_hostname = 'Host-0 (08:00:27:70:1a:03)'\nSegment by:   host_mac, container_name\nWhen:         avg(sysdig_container_cpu_used_percent) > 85\nFor at least: 10 m\nAlert URL:    https://app.sysdigcloud.com/#/alerts/rules?alertId=5712\n\n\n"
#   },
#   "event": {
#     "id": 1680,
#     "url": "https://app.sysdigcloud.com/#/events/notifications/l:604800/1680/details",
#     "username": "cw4886130@gmail.com"
#   },
#   "condition": "avg(sysdig_container_cpu_used_percent) > 85",
#   "source": "Sysdig Cloud",
#   "state": "ACTIVE",
#   "timestamp": 1663014917135000,
#   "timespan": 600000000,
#   "entities": [
#     {
#       "entity": "host_mac = '08:00:27:70:1a:03' and container_name = 'container1_0'",
#       "metricValues": [
#         {
#           "metric": "sysdig_container_cpu_used_percent",
#           "aggregation": "avg",
#           "groupAggregation": "avg",
#           "value": 91.73006147775284
#         }
#       ]
#     }
#   ]
# }
#   JSON
# }