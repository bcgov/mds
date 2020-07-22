FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0
COPY init.sh .
COPY hooks ./hooks

# Install project dependencies
COPY requirements.txt ${APP_ROOT}/src
RUN source /opt/app-root/etc/scl_enable && \
    set -x && \
    pip install -U pip setuptools wheel && \
    cd ${APP_ROOT}/src && pip install -r requirements.txt

USER 1001
ENTRYPOINT [ "./init.sh" ]
