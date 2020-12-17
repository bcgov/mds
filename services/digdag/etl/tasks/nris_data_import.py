from models.pod import POD

from util.env_builder import EnvBuilder


def run_job():

    builder = EnvBuilder()
    builder.add_value(key='APP_FILE', value='/opt/app-root/src/run_etl.py')
    env = builder.to_json()

    pod = POD(pod_name='digdag-nris-job', env_pod='mds-nris-backend', env=env)

    pod.create_pod()
    print("Job finished")
