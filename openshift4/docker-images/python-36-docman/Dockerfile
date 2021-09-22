FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Celery directory
RUN mkdir -p /tmp/celery && chmod -R 777 /tmp/celery

# Install project dependencies
COPY requirements.txt ${APP_ROOT}/src
RUN source /opt/app-root/etc/scl_enable && \
    set -x && \
    pip install -U pip setuptools wheel && \
    cd ${APP_ROOT}/src && pip install -r requirements.txt
