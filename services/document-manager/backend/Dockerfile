FROM python:3.6

# Update installation utility
RUN apt-get update

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# RUN mkdir -p /var/log/celery /var/run/celery
# RUN chmod -R ugo+rwx /var/log/celery
# RUN chmod -R ugo+rwx /var/run/celery
# WORKDIR /app
# RUN celery worker -A app.tasks.celery --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=1

# RUN celery multi start worker1 --pidfile="/var/run/celery/celery.pid" --logfile="/var/log/celery/celery.log"
# Run the server
EXPOSE 5001

ENTRYPOINT [ "./init.sh" ]