#!/usr/bin/python3.9
import json
import logging
import urllib3

from aws_lambda_powertools.utilities import parameters

http = urllib3.PoolManager()

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    
    # Retrieve a single secret
    value = json.loads(parameters.get_secret("prod/mds/discord-webhook-link")).get("discord-webhook-link")
    
    url = f"{value}"
    if event is None:
     raise Exception("There must be an event to process the request")
    
    logger.info('## EVENT\r' + str(event))
    logger.info('## CONTEXT\r' + str(context))
    
    # Try exception for different formatting
    try:
      body = json.loads(event.get("body"))
    except Exception:
      body = event.get("body")
      
    
    if body is None:
      response = {
        "statusCode": "404",
        "headers": {
          "Content-Type": "text/plain",
          "x-amzn-ErrorType": "404"
        },
        "isBase64Encoded": "false",
        "body": "sysdig message body is null"
      }
    
      return response
    
    
    alert = body.get("alert", "")
    resolved = body.get("resolved", "")
    event_details =  body.get("event", "")
    condition = body.get("condition", "")
    entities = body.get("entities", "")
    labels = alert.get("labels", {})

    if entities:
      entities = entities[0].get("metricValues", "")
    
    # Colour in decimal to associate with severity (0-7). Discord requires this to be decimal
    # Refer to https://docs.sysdig.com/en/docs/sysdig-monitor/events/severity-and-status/
    # for guide to event severity
    
    alert_severity_number = alert.get("severity", "default")

    colours = {
      "0": 16711680, # emergency
      "1": 16711680, # alert
      "2": 16744192, # critical
      "3": 16744192, # error
      "4": 16776960, # warning
      "5": 16776960, # notice
      "6": 26316, # informational
      "7": 26316, # debug

      "default": 16776960
    }

    alert_colour = colours.get(str(alert_severity_number))

    condition_scope_str = str(condition)

    if alert.get("scope"):
      condition_scope_str = str(str(condition) + "\n for " + str(alert.get("scope", "")))


    title = f'{labels.get("kube_workload_name", "")}: {labels.get("kube_namespace_label_environment")} - {alert.get("name", " ")}'[:255] # limit of 256 characters
    
    msg = {

        "content": "",
        "embeds": [
        {
          "author": {
            "name": "Sysdig Monitor",
            "url": "https://app.sysdigcloud.com/api/oauth/openid/bcdevops",
          },
          "title": title,
          "url": event_details.get("url", " "),
          "color": alert_colour,
          "fields": [
            {
              "name": "Severity",
              "value": str(alert.get("severityLabel", " "))[:1023], # limit of 1024 characters
              "inline": "true"
            },
            {
              "name": "Namespace",
              "value": labels.get("kube_namespace_name", "")[:1023], # limit of 1024 characters
              "inline": "true"
            },
            {
              "name": "Service",
              "value": labels.get("kube_workload_name", "")[:1203], # limit of 1024 characters
              "inline": "true"
            },
            {
              "name": "Condition and Scope",
              "value": condition_scope_str[:1023] # limit of 1024 characters
            },
            {
              "name": "Metric Values",
              "value": str(entities)[:1023]
            },
            {
              "name": "Resolved",
              "value": "true" if resolved == "true" else "false"
            }
         ]
        }]
    }
    
    encoded_msg = json.dumps(msg).encode("utf-8")
    
    resp = http.request("POST", url, body=encoded_msg,
                        headers={
                            'Content-Type': 'application/json',
                            'Accept': '*/*',
                            'Accept-Encoding': 'gzip'
                        })
                        
    print(
        {
            "status_code": resp.status,
            "response": resp.data,
        }
    )


    response = {
      "statusCode": resp.status,
      "headers": {
        "Content-Type": "text/plain",
        "x-amzn-ErrorType": resp.status
      },
      "isBase64Encoded": "false",
      "body": resp.data
    }
    
    return response

    