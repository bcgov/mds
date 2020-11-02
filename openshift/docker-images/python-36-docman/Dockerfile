FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Install sonar-scanner
RUN curl -sLo /tmp/sonar-scanner-cli.zip https://dl.bintray.com/sonarsource/SonarQube/org/sonarsource/scanner/cli/sonar-scanner-cli/3.2.0.1227/sonar-scanner-cli-3.2.0.1227-linux.zip && \
    mkdir ${APP_ROOT}/sonar-scanner-cli && unzip -q /tmp/sonar-scanner-cli.zip -d ${APP_ROOT}/sonar-scanner-cli && \
    mv ${APP_ROOT}/sonar-scanner-cli ${APP_ROOT}/_sonar-scanner-cli && mv ${APP_ROOT}/_sonar-scanner-cli/sonar-scanner-3.2.0.1227-linux ${APP_ROOT}/sonar-scanner-cli && \
    rm -rf ${APP_ROOT}/_sonar-scanner-cli \
    rm /tmp/sonar-scanner-cli.zip && \
    chmod -R 755 ${APP_ROOT}/sonar-scanner-cli


# Install project dependencies
COPY requirements.txt ${APP_ROOT}/src
RUN source /opt/app-root/etc/scl_enable && \
    set -x && \
    pip install -U pip setuptools wheel && \
    cd ${APP_ROOT}/src && pip install -r requirements.txt

# celery
# RUN cd /var/log
#     mkdir celery
#     chmod -R ugo+rwx celery
#     cd /var/run
#     mkdir celery
#     chmod -R ugo+rwx celery
#     cd /opt/app-root/src
    # celery worker -A app.tasks.celery --detach --loglevel=info --logfile=/var/log/celery/celery.log --pidfile=/var/run/celery/celery.pid --concurrency=1\\
USER 0
RUN mkdir -p /var/log/celery /var/run/celery
RUN chmod -R ugo+rwx /var/log/celery
RUN chmod -R ugo+rwx /var/run/celery
RUN celery multi start worker1 --pidfile="/var/run/celery/celery.pid" --logfile="/var/log/celery/celery.log"

USER 1001