FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Twiddle the permissions on ensure things can be run as an arbitrary user.
RUN mkdir -p ${HOME} && \
    groupadd -r default -f -g 1001 && \
    useradd -u 1001 -r -g default -d ${HOME} -s /sbin/nologin \
    -c "Default Application User" default && \
    chown -R 1001:1001 /app && \
    chmod -R ug+rwx /app

#switch back to default user
USER 1001