import json
import os
import time
from kubernetes import config
from openshift.dynamic import DynamicClient
from openshift.dynamic.exceptions import ConflictError


class POD():
    """
    Helper class to create a pod template and spin up an openshift pod.
    Currently only supports single container pods. Refer to templates/pod.json
    for the base template used.

    :param pod_name: Name of the pod to be created
    :param env_pod: Name of the pod to fetch environment vars and base image from

    :param command: Command to run on pod startup
    :param env_container_id: Container ID of the env_pod, usually 0 for single container pods
    """

    kube_config = os.getenv("KUBECONFIG", "/root/.kube/config")
    namespace = os.getenv("NAMESPACE", "empr-mds-dev")
    image_tag = os.getenv("IMAGE_TAG", "dev-pr-NUM")
    suffix = os.getenv("SUFFIX", "-pr-NUM")

    def __init__(
        self, pod_name, env_pod, command, image_namespace=None, image_tag=None, env=None, env_container_id=0
    ):
        self.pod_name = pod_name if pod_name else "digdag-mds-job"
        self.env_pod = env_pod if env_pod else "digdag-mds-job"
        self.command = command if command else ["flask", "test-cli-command"]
        self.env_container_id = env_container_id

        # If env, creating container from scratch, pull from tools build suffix
        if (env):
            self.env = env
            self.image = f"docker-registry.default.svc:5000/{image_namespace}/{self.env_pod}:build{self.suffix}"

        # Else creating based on existing image and pod, requires tag
        else:
            self.env = None
            self.image = f"docker-registry.default.svc:5000/{self.namespace}/{self.env_pod}:{self.image_tag}"

        self.job_pod_name = self.pod_name + self.suffix
        self.env_pod_name = self.env_pod + self.suffix
        self.job_pod_label = f"name={self.job_pod_name}"
        self.env_pod_label = f"name={self.env_pod_name}"

        k8s_client = config.new_client_from_config(self.kube_config)
        dyn_client = DynamicClient(k8s_client)

        self.v1_pod = dyn_client.resources.get(api_version="v1", kind="Pod")

    def get_pod_template(self):
        """
        Returns a JSON object representing an Pod template
        """
        json_data = self.create_pod_template()

        if (self.env is not None):
            json_data["spec"]["containers"][0]["env"] = json.loads(self.env)
        else:
            # Update env from existing pod
            current_running_pod = self.v1_pod.get(
                label_selector=self.env_pod_label, namespace=self.namespace
            )
            env_dict = (
                current_running_pod.to_dict()["items"][0]["spec"]["containers"][
                    self.env_container_id
                ]["env"]
                if current_running_pod
                else []
            )
            json_data["spec"]["containers"][0]["env"] = env_dict

        return json_data

    def create_pod_template(self):
        """
        Returns a JSON object representing an Pod template, adds environment variables        
        :param env: Dictionary of environment variables
        :type env: dict
        """
        json_data = {}
        with open("templates/pod.json") as pod_file:
            json_data = json.load(pod_file)

        json_data["metadata"]["labels"]["app"] = self.job_pod_name
        json_data["metadata"]["labels"]["name"] = self.job_pod_name
        json_data["metadata"]["name"] = self.job_pod_name
        json_data["metadata"]["namespace"] = self.namespace
        json_data["spec"]["containers"][0]["command"] = self.command
        json_data["spec"]["containers"][0]["name"] = self.job_pod_name
        json_data["spec"]["containers"][0]["image"] = self.image

        return json_data

    def create_pod(self, pod_template=None):
        """
        Creates a pod given a JSON template and waits for it to finish running.
        Returns the created pod resource object.
        """
        pod_template = pod_template if pod_template else self.get_pod_template()
        result = None
        try:
            result = self.v1_pod.create(
                body=pod_template, namespace=self.namespace)
        except ConflictError as e:
            print("Pod exists, recreating")
            self.v1_pod.delete(name=self.job_pod_name,
                               namespace=self.namespace)
            # Wait for pod to disappear, it can take a while if running
            time.sleep(60)
            # Then create it
            result = self.v1_pod.create(
                body=pod_template, namespace=self.namespace)

        # Wait for pod to be created before polling it for status
        time.sleep(30)

        # Watch the pod status and exit the job with success or raise exception
        for e in self.v1_pod.watch(
            label_selector=self.job_pod_label, namespace=self.namespace
        ):
            print("******** Pod Status ********")
            print(e["object"].status)

            current_state = e["object"].status.containerStatuses[0].state
            if "terminated" in current_state.keys():
                if current_state["terminated"]["exitCode"] == 0:
                    print("Pod exited Successfully")
                else:
                    raise Exception("Pod exited with an error, refer to logs")
                break
            elif "error" in current_state.keys():
                raise Exception("Pod exited with an error, refer to logs")
            else:
                print("******** Pod Running ********")

        return result
