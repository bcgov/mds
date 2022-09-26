module "4c29ba9-team" {
  source                   = "./silver-4c2ba9-team"
  sysdig_monitor_api_token = var.silver_4c2ba9_team_sysdig_monitor_api_token
}

# resource "sysdig_monitor_notification_channel_webhook" "discord_webhook" {
#     name                    = "Discord-Sysdig-notifications"
#     enabled                 = true
#     url                     = "${aws_apigatewayv2_stage.lambda.invoke_url}/notify"
#     notify_when_ok          = false
#     notify_when_resolved    = false
#     send_test_notification  = true
#     additional_headers = {
#       "Content-Type": "application/json"
#     }
# }