from models.pod import POD
import os
from util.env_builder import EnvBuilder


def sample_task():

    env = os.getenv("ENV", "dev")
    suffix = os.getenv("SUFFIX", "-pr-NUM")

    image_tag = ""
    if (env == "dev"):
        image_tag = suffix
    else:
        image_tag = f"-{env}"

    pod = POD(
        pod_name='digdag-sample-task',
        env_pod='mds-sample-task',
        image_namespace='empr-mds-tools',
        image_tag=f'build{image_tag}',
        command=["python", "sample.py"])

    pod.create_pod()
    print("Job finished")
