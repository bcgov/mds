import yaml
import os
from kubernetes import client, config
from openshift.dynamic import DynamicClient


class NrisETL(object):

    def run_job(self):

        kube_config = os.getenv('KUBECONFIG', '/app/kube_config')

        # api_client = client.ApiClient(conf)
        k8s_client = config.new_client_from_config(kube_config)
        dyn_client = DynamicClient(k8s_client)

        v1_jobs = dyn_client.resources.get(
            api_version='v1', namespace='empr-mds-dev', kind='Job', name='pi')

        job = """
        apiVersion: extensions/v1beta1
        kind: Job
        metadata:
        name: nris_etl
        spec:
        parallelism: 1
        completions: 1
        template:
            metadata:
            name: nris_etl
            labels:
                app: nris_etl
            spec:
            containers:
            - name: nris_etl
                image: perl
                command: ["flask",  "run_nris_etl_job"]
            restartPolicy: Never
        """

        job_data = yaml.load(job)
        resp = v1_jobs.create(body=job_data, namespace='empr-mds-dev')

        # resp is a ResourceInstance object
        print(resp.metadata)
