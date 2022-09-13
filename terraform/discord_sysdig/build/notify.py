#!/usr/bin/python3.9
import urllib3
import json
import sys

from datetime import datetime, timedelta

http = urllib3.PoolManager()


def lambda_handler(event, context):
    url = "https://discordapp.com/api/webhooks/1019009944864952330/yJLd0xhoyzGzrqSh6Al2bIezLY58XHia8Drcol8_J1N1E-qenCkGWsHXBSs3-LdjejDs"
    
    if event is None:
      sys.exit()
    
    body = json.loads(event.get("body"))

    alert = body.get("alert", "")
    event_details =  body.get("event", "")
    condition = body.get("condition", "")
    timestamp = body.get("timestamp", "")
    
    entities = body.get("entities", "")
    
    #TODO: Format timestamp 
    
    msg = {

        "content": "",
        "embeds": [
        {
          "author": {
            "name": "Sysdig Monitor",
            "url": "https://app.sysdigcloud.com/api/oauth/openid/bcdevops",
          },
          "title": alert.get("name", ""),
          "url": event_details.get("url", ""),
          "description": alert.get("description", ""),
          "color": 15258703,
          "fields": [
            {
              "name": "Severity",
              "value": alert.get("severityLabel", ""),
              "inline": "true"
            },
            {
              "name": "Condition and Scope",
              "value": str(condition) + "\n for " + str(alert.get("scope", "")),
              "inline": "true"
            },
            {
              "name": "Entities / More info",
              "value": str(entities)
            },
            {
              "name": "Timestamp",
              "value": str(timestamp)
            }
         ]
        }]
    }
    
    encoded_msg = json.dumps(msg).encode("utf-8")
    
    resp = http.request("POST", url, body=encoded_msg,
                        headers={
                            'Content-Type': 'application/json'
                        })
                        
    print(
        {
            "status_code": resp.status,
            "response": resp.data,
        }
    )
