from models.pod import POD
import os
from util.env_builder import EnvBuilder

def run_job():
    pod = POD(pod_name='digdag-reporting-database-restore', env_pod='mds-database-backup', command=["tail", "-f","/dev/null"])
    pod.create_pod()
    print("Job finished")
