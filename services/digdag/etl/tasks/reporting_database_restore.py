from models.pod import POD
import os
from util.env_builder import EnvBuilder

def run_job():
    pod = POD(pod_name='digdag-reporting-database-restore', env_pod='mds-database-backup-pr-1153', command=["./backup.sh", "-r mds-postgresql-pr-1153-reporting/mds", "-f mds-postgres"])
    pod.create_pod()
    print("Job finished")
