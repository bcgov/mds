import json
import os
import time
from kubernetes import config
from openshift.dynamic import DynamicClient
from openshift.dynamic.exceptions import ConflictError


class POD():

    kube_config = os.getenv('KUBECONFIG', '/root/.kube/config')
    namespace = os.getenv('NAMESPACE', 'empr-mds-dev')
    image_tag = os.getenv('IMAGE_TAG', 'dev-pr-863')
    suffix = os.getenv('SUFFIX', '-pr-863')

    def __init__(self, pod_name, env_pod, command):
        self.pod_name = pod_name if pod_name else "digdag-mds-job"
        self.env_pod = env_pod if env_pod else "digdag-mds-job"
        self.command = command if command else ["flask", "test-cli-command"]

        self.job_pod_name = self.pod_name + self.suffix
        self.env_pod_name = self.env_pod + self.suffix
        self.job_pod_label = f"name={self.job_pod_name}"
        self.env_pod_label = f"name={self.env_pod_name}"
        self.image = f"docker-registry.default.svc:5000/{self.namespace}/{self.env_pod}:{self.image_tag}"

        k8s_client = config.new_client_from_config(self.kube_config)
        dyn_client = DynamicClient(k8s_client)

        self.v1_pod = dyn_client.resources.get(api_version='v1', kind='Pod')

    def get_pod_template(self):
        json_data = {}
        with open('templates/pod.json') as pod_file:
            json_data = json.load(pod_file)

        json_data['metadata']['labels']['app'] = self.job_pod_name
        json_data['metadata']['labels']['name'] = self.job_pod_name
        json_data['metadata']['name'] = self.job_pod_name
        json_data['spec']['containers'][0]['command'] = self.command
        json_data['spec']['containers'][0]['name'] = self.job_pod_name
        json_data['spec']['containers'][0]['image'] = self.image

        # Update env from existing pod
        current_running_pod = self.v1_pod.get(label_selector=self.env_pod_label, namespace=self.namespace)
        json_data['spec']['containers'][0]['env'] = current_running_pod.to_dict()['items'][0]['spec']['containers'][0]['env']

        return json_data

    def create_pod(self, pod_template=None):
        pod_template = pod_template if pod_template else self.get_pod_template()
        try:
            self.v1_pod.create(body=pod_template, namespace=self.namespace)
        except ConflictError as e:
            print("Pod exists, recreating")
            self.v1_pod.delete(name=self.job_pod_name, namespace=self.namespace)
            # Wait for pod to disappear, it can take a while if running
            time.sleep(60)
            # Then create it
            self.v1_pod.create(body=pod_template, namespace=self.namespace)

        # Wait for pod to be created
        time.sleep(10)

        # Watch the pod status and exit the job with success or raise exception
        for e in self.v1_pod.watch(label_selector=self.job_pod_label, namespace=self.namespace):
            print("******** Pod Status ********")
            print(e['object'].status)

            current_state = e['object'].status.containerStatuses[0].state
            if 'terminated' in current_state.keys():
                if current_state['terminated']['exitCode'] == 0:
                    print("Pod exited Successfully")
                else:
                    raise Exception('Pod exited with an error, refer to logs')
                break
            elif 'error' in current_state.keys():
                raise Exception('Pod exited with an error, refer to logs')
            else:
                print("******** Pod Running ********")
