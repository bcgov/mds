FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV LD_LIBRARY_PATH="/opt/oracle/instantclient" \
    OCI_HOME="/opt/oracle/instantclient" \
    OCI_LIB_DIR="/opt/oracle/instantclient" \
    OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"

COPY /oracle/ .

USER 0

# yum install removed for openshift build
# pkgs build-essential libaio1 python-minimal - don't exist for RHEL 
# pkgs curl unzip git - are all already installed on python RHEL image

RUN mkdir -p opt/oracle && \
    unzip instantclient-basic-linux.x64-19.3.0.0.0.zip -d /opt/oracle && \
    unzip instantclient-sdk-linux.x64-19.3.0.0.0.zip -d /opt/oracle && \
    mv /opt/oracle/instantclient_19_3 /opt/oracle/instantclient && \
    echo '/opt/oracle/instantclient/' | tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && ldconfig && \
    rm -rf instantclient-basic-linux.x64-19.3.0.0.0.zip instantclient-sdk-linux.x64-19.3.0.0.0.zip && \
    rm -rf /var/lib/apt/lists/*

USER 1001


# Install the requirements
COPY requirements.txt ${APP_ROOT}/src
RUN cd ${APP_ROOT}/src && pip install --no-cache-dir -r requirements.txt
