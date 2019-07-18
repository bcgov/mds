import yaml
import os
from kubernetes import config
from openshift.dynamic import DynamicClient


class NrisETL(object):

    def run_job(self):

        kube_config = os.getenv('KUBECONFIG', '/app/kube_config')

        # api_client = client.ApiClient(conf)
        k8s_client = config.new_client_from_config(kube_config)
        dyn_client = DynamicClient(k8s_client)

        v1_jobs = dyn_client.resources.get(api_version='v1', kind='Job')

        job = """
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

        job_data = job
        try:
            resp = v1_jobs.create(body=job_data, namespace='empr-mds-dev')
        except:
            print("Job exists! Delete and create instead")
            v1_jobs.delete(name='digdag-nris', namespace='empr-mds-dev')
            resp = v1_jobs.create(body=job_data, namespace='empr-mds-dev')

        # Watch hangs, comment out for now
        # for event in v1_jobs.watch(namespace='empr-mds-dev'):
        #    print(event['object'])

        print("Job finished")
        # resp is a ResourceInstance object
        print(resp.metadata)
