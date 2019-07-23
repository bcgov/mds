import json
import os
import time
from kubernetes import config
from openshift.dynamic import DynamicClient
from openshift.dynamic.exceptions import ConflictError


def run_job():

    kube_config = os.getenv('KUBECONFIG', '/root/.kube/config')
    namespace = os.getenv('NAMESPACE', 'empr-mds-dev')
    image_tag = os.getenv('IMAGE_TAG', 'dev-pr-863')
    suffix = os.getenv('SUFFIX', '-pr-863')

    job_pod_name = "digdag-idir-job" + suffix
    api_pod_name = "mds-python-backend" + suffix
    job_pod_label = "name=digdag-idir-job" + suffix
    api_pod_label = "name=mds-python-backend" + suffix

    k8s_client = config.new_client_from_config(kube_config)
    dyn_client = DynamicClient(k8s_client)

    v1_pod = dyn_client.resources.get(api_version='v1', kind='Pod')

    with open('templates/pod.json') as pod_file:
        pod_json_template = json.load(pod_file)

    def template_values(json_data):
        json_data['metadata']['labels']['app'] = job_pod_name
        json_data['metadata']['labels']['name'] = job_pod_name
        json_data['metadata']['name'] = job_pod_name
        json_data['spec']['containers'][0]['command'] = ["flask","import_idir"]
        json_data['spec']['containers'][0]['name'] = job_pod_name
        json_data['spec']['containers'][0]['image'] = f"docker-registry.default.svc:5000/{namespace}/mds-python-backend:{image_tag}"

        # Update env from existing pod
        current_running_pod = v1_pod.get(label_selector=api_pod_label, namespace=namespace)
        json_data['spec']['containers'][0]['env'] = current_running_pod.to_dict()['items'][0]['spec']['containers'][0]['env']

        return json_data

    pod_json_data = template_values(pod_json_template)

    try:
        v1_pod.create(body=pod_json_data, namespace=namespace)
    except ConflictError as e:
        print("Pod exists, recreating")
        v1_pod.delete(name=job_pod_name, namespace=namespace)
        # Wait for pod to disappear, it can take a while if running
        time.sleep(60)
        # Then create it
        v1_pod.create(body=pod_json_data, namespace=namespace)

    # Wait for pod to be created
    time.sleep(10)

    # Watch the pod status and exit the job with success or raise exception
    for e in v1_pod.watch(label_selector=job_pod_label, namespace=namespace):
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


    print("Job finished")
