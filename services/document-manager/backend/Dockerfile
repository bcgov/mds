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

# Run the server
EXPOSE 5001
# RUN mkdir -p /var/log/celery /var/run/celery
USER 0
RUN mkdir -p /var/log/celery /var/run/celery
RUN chmod -R ugo+rwx /var/log/celery
RUN chmod -R ugo+rwx /var/run/celery
RUN celery multi start worker1 --pidfile="/var/run/celery/celery.pid" --logfile="/var/log/celery/celery.log"

USER 1001
ENTRYPOINT [ "./init.sh" ]