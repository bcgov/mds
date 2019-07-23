from tasks.models import POD

def run_job():

    pod = POD(pod_name='digdag-idir-job', env_pod='mds-python-backend', command=["flask","import_idir"])
    pod.create_pod()
    print("Job finished")
