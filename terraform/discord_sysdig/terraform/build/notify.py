#!/usr/bin/python3.9
import urllib3
import json
import sys
import logging

from datetime import datetime, timedelta

http = urllib3.PoolManager()

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    url = "https://discordapp.com/api/webhooks/1019009944864952330/yJLd0xhoyzGzrqSh6Al2bIezLY58XHia8Drcol8_J1N1E-qenCkGWsHXBSs3-LdjejDs"

    if event is None:
     raise Exception("There must be an event to process the request")
    
    print(event)
    
    logger.info('## EVENT\r' + str(event))
    logger.info('## CONTEXT\r' + str(context))
    
    # Try exception for different formatting
    try:
      body = json.loads(event.get("body"))
    except Exception:
      body = event.get("body")
    
    alert = body.get("alert", "")
    event_details =  body.get("event", "")
    condition = body.get("condition", "")
    entities = body.get("entities", "")
    
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

    
    condition_scope_str = str(str(condition) + "\n for " + str(alert.get("scope", "")))
    
    msg = {

        "content": "",
        "embeds": [
        {
          "author": {
            "name": "Sysdig Monitor",
            "url": "https://app.sysdigcloud.com/api/oauth/openid/bcdevops",
          },
          "title": alert.get("name", " ")[:255], # limit of 256 characters
          "url": event_details.get("url", " "),
          "color": alert_colour,
          "fields": [
            {
              "name": "Severity",
              "value": str(alert.get("severityLabel", " "))[:1023], # limit of 1024 characters
              "inline": "true"
            },
            {
              "name": "Condition and Scope",
              "value": condition_scope_str[:1023], # limit of 1024 characters
              "inline": "true"
            },
            {
              "name": "Metric Values",
              "value": str(entities)[:1023]
            }
         ]
        }]
    }
    
    encoded_msg = json.dumps(msg).encode("utf-8")[:5999]
    
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

    