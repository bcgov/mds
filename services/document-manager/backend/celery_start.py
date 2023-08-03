import subprocess

worker_cmd = "celery -A app.tasks.celery worker --detach --loglevel=info --concurrency=1"
subprocess.Popen(worker_cmd, cwd='.', close_fds=True, shell=True)