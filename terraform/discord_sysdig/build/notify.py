#!/usr/bin/python3.9
import urllib3
import json

from datetime import datetime, timedelta

http = urllib3.PoolManager()


def lambda_handler(event, context):
    url = "https://discordapp.com/api/webhooks/1019009944864952330/yJLd0xhoyzGzrqSh6Al2bIezLY58XHia8Drcol8_J1N1E-qenCkGWsHXBSs3-LdjejDs"
    
    alert = event["alert"]
    event_details = event["event"]
    condition = event["condition"]
    timestamp = event["timestamp"]
    entities = event["entities"]
    
    
    epoch = datetime(1601, 1, 1)
    
    timestamp_datetime = epoch + timedelta(microseconds=timestamp)

    
    
    
    # timestamp_datetime = datetime.fromtimestamp(int(timestamp) / 1000)

    msg = {

        "content": "",
        "embeds": [
        {
          "author": {
            "name": "Sysdig Monitor",
            "url": "https://app.sysdigcloud.com/api/oauth/openid/bcdevops",
          },
          "title": alert['name'],
          "url": event_details["url"],
          "description": alert["description"],
          "color": 15258703,
          "fields": [
            {
              "name": "Severity",
              "value": alert['severityLabel'],
              "inline": "true"
            },
            {
              "name": "Condition and Scope",
              "value": str(condition) + "\n for " + str(alert['scope']),
              "inline": "true"
            },
            {
              "name": "Entities / More info",
              "value": str(entities)
            },
            {
              "name": "Timestamp",
              "value": str(timestamp_datetime)
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
