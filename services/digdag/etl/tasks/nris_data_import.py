from models.pod import POD

from util.env_builder import EnvBuilder


def run_job():

    builder = EnvBuilder()
    builder.add_value(key='ETL_MODE', value='1')
    env = builder.to_json()

    pod = POD(pod_name='digdag-nris-job', env_pod='mds-nris-backend', env=env, command=None)

    pod.create_pod()
    print("Job finished")
