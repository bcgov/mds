import json
import os
import time
import logging
from kubernetes import config
from openshift.dynamic import DynamicClient


class NrisETL(object):

    def run_job(self):

        kube_config = os.getenv('KUBECONFIG', '/root/.kube/config')
        namespace = os.getenv('NAMESPACE', 'empr-mds-dev')
        image_tag = os.getenv('IMAGE_TAG', 'dev-pr-863')
        suffix = os.getenv('SUFFIX', '-pr-863')
        app_name = "digdag-mds" + suffix

        # api_client = client.ApiClient(conf)
        k8s_client = config.new_client_from_config(kube_config)
        dyn_client = DynamicClient(k8s_client)

        v1_pod = dyn_client.resources.get(api_version='v1', kind='Pod')

        with open('templates/pod.json') as pod_file:
            pod_json_template = json.load(pod_file)

        def template_values(json_data):
            json_data['metadata']['labels']['app'] = app_name
            json_data['metadata']['name'] = app_name
            json_data['spec']['containers'][0]['command'] = ["flask","test-cli-command"]
            json_data['spec']['containers'][0]['name'] = app_name
            json_data['spec']['containers'][0]['image'] = f"docker-registry.default.svc:5000/{namespace}/mds-nris-backend:{image_tag}"
            return json_data

        pod_json_data = template_values(pod_json_template)

        try:
            v1_pod.create(body=pod_json_data, namespace=namespace)
        except Exception as e:
            v1_pod.delete(name=app_name, namespace=namespace)
            # Wait for pod to disappear
            time.sleep(5)
            # Then create it
            v1_pod.create(body=pod_json_data, namespace=namespace)


        for e in v1_pod.watch(resource_version=0, label_selector=f'app={app_name}', namespace=namespace, timeout=100):
            logging.info(e['object'].metadata)
            logging.info(e['object'].status)
            if e['object'].status.phase == 'Succeeded':
                break

        print("Pod finished")
