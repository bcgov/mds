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

        with open('/app/project/templates/pod.json') as pod_file:
            pod_json_template = json.load(pod_file)

        def template_values(json_data):
            json_data['metadata']['labels']['app'] = 'digdag-mds-pr-853'
            json_data['metadata']['name'] = 'digdag-mds-pr-853'
            json_data['spec']['containers'][0]['command'] = ["flask","test_cli_command"]
            json_data['spec']['containers'][0]['name'] = 'digdag-mds-pr-853'
            json_data['spec']['containers'][0]['image'] = 'docker-registry.default.svc:5000/empr-mds-dev/mds-nris-backend:dev-pr-863'
            return json_data

        pod_json_data = template_values(pod_json_template)

        try:
            resp = v1_pod.create(body=pod_json_data, namespace='empr-mds-dev')
        except Exception as e:
            resp = e
            print(e)

        for event in v1_pod.watch(namespace='empr-mds-dev', name='digdag-mds-pr-853'):
           print(event['object'])

        print("Pod finished")
        # resp is a ResourceInstance object
        print(resp.metadata)
