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

        v1_jobs = dyn_client.resources.get(api_version='v1', kind='Job')

        job = """
kind: Job
metadata:
  labels:
    app: digdag
  name: digdag-nris
  namespace: empr-mds-dev
spec:
  template:
    metadata:
      labels:
        job-name: digdag-nris
    spec:
      containers:
      - command:
        - echo
        - IAmUp
        image: mds-nris-backend:dev-pr-863
        imagePullPolicy: Always
        name: digdag-nris
        resources: {}
        terminationMessagePath: "/dev/termination-log"
        terminationMessagePolicy: File
      dnsPolicy: ClusterFirst
      restartPolicy: Never
      terminationGracePeriodSeconds: 30
"""

        job_data = yaml.load(job)
				try:
					resp = v1_jobs.create(body=job_data, namespace='empr-mds-dev')
				except:
					print("Job exists! Replace instead")
        	resp = v1_jobs.replace(body=job_data, namespace='empr-mds-dev')

				for event in v1_jobs.watch(namespace='empr-mds-dev'):
    			print(event['object'])

				print("Job finished")
        # resp is a ResourceInstance object
        print(resp.metadata)
