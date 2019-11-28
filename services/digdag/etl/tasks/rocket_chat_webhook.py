import requests
import os
import json

webhook_url = os.getenv("WEBHOOK_URL", "https://sample.url")
namespace = os.getenv("NAMESPACE", "empr-mds-dev")

data = {
  "status": "task_status",
  "namespace": "namespace",
  "message": "message"
}

emoji =	{
  "RUNNING": "person_running",
  "SUCCESS": "white_check_mark",
  "FAIL": "x",
  "UNDEFINED": "person_shrugging"
}


def send(job_name="", status="UNDEFINED"):
    # Format message
    data['status'] = status
    data['namespace'] = namespace
    data['message'] = f'''
    Job status: {status} :{emoji[status]}:
    Job name: {job_name}
    Job namespace: {namespace}
    '''

    # Send webhook
    headers = {'Content-type': 'application/json'}
    requests.post(webhook_url, data=json.dumps(data), headers=headers)

