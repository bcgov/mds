import json
import os
from kubernetes import config
from openshift.dynamic import DynamicClient


class NrisETL(object):

    def run_job(self):

        kube_config = os.getenv('KUBECONFIG', '/root/.kube/config')

        # api_client = client.ApiClient(conf)
        k8s_client = config.new_client_from_config(kube_config)
        dyn_client = DynamicClient(k8s_client)

        v1_pod = dyn_client.resources.get(api_version='v1', kind='Pod')

        pod_def = """
        {
  "apiVersion": "v1",
  "kind": "Pod",
  "metadata": {
    "labels": {
      "app-name": "mds",
      "app": "mds-pr-863"
    },
    "name": "mds-digdag-pr-863",
    "namespace": "empr-mds-dev"
  },
  "spec": {
    "containers": [
      {
        "command": ["flask", "test_cli_command"],
        "image": "docker-registry.default.svc:5000/empr-mds-dev/mds-nris-backend:dev-pr-863",
        "imagePullPolicy": "Always",
        "name": "mds-digdag-pr-863"
      }
    ],
    "dnsPolicy": "ClusterFirst"
  }
}
        """

        json_data = json.loads(pod_def)
        try:
            resp = v1_pod.create(body=json_data, namespace='empr-mds-dev')
        except Exception as e:
            resp = e
            print(e)

        # Watch hangs, comment out for now
        # for event in v1_jobs.watch(namespace='empr-mds-dev'):
        #    print(event['object'])

        print("Pod finished")
        # resp is a ResourceInstance object
        print(resp.metadata)
