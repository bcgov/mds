from models.pod import POD

def run_job():
    pod = POD(pod_name='digdag-nris-job', env_pod='mds-nris-backend', command=["flask","run-nris-etl-job"])
    pod.create_pod()
    print("Job finished")
