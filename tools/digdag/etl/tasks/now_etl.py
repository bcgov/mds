from models.pod import POD


def run_job():
    env = {

    }

    pod = POD(pod_name='digdag-now-etl',
              env_pod='mds-now-etl',
              env=env,
              image_namespace='empr-mds-tools',
              command=["python", "now_etls.py"])

    pod.create_pod()
    print("Job finished")
