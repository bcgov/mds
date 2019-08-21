from models.pod import POD


def run_job():
    pod = POD(pod_name='digdag-now-etl', env_pod='mds-now-etl',
              command=["python", "now_etls.py"])
    pod.create_pod()
    print("Job finished")
