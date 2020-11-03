import subprocess

worker_cmd = "celery worker -A app.tasks.celery --detach --loglevel=info --concurrency=1"
subprocess.Popen(worker_cmd, cwd='/app', close_fds=True, shell=True)