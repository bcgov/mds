FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV LD_LIBRARY_PATH="${APP_ROOT}/oracle_bin/instantclient" \
    OCI_HOME="$APP_ROOT/oracle_bin/instantclient" \
    OCI_LIB_DIR="$APP_ROOT/oracle_bin/instantclient" \
    OCI_INCLUDE_DIR="$APP_ROOT/oracle_bin/instantclient/sdk/include"

RUN mkdir -p /tmp/oracle
COPY oracle/ /tmp/oracle

RUN mkdir -p ${APP_ROOT}/oracle_bin

USER 0

RUN yum -y install libaio

# yum install removed for openshift build
# pkgs build-essential libaio1 python-minimal - don't exist for RHEL 
# pkgs curl unzip git - are all already installed on python RHEL image

RUN unzip /tmp/oracle/instantclient-basic-linux.x64-19.3.0.0.0.zip -d ${APP_ROOT}/oracle_bin && \
    unzip /tmp/oracle/instantclient-sdk-linux.x64-19.3.0.0.0.zip -d ${APP_ROOT}/oracle_bin && \
    mv ${APP_ROOT}/oracle_bin/instantclient_19_3 ${APP_ROOT}/oracle_bin/instantclient 

RUN echo '${APP_ROOT}/oracle_bin/instantclient/' | tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && ldconfig && \
    rm -rf /tmp/oracle/instantclient-basic-linux.x64-19.3.0.0.0.zip /tmp/oracle/instantclient-sdk-linux.x64-19.3.0.0.0.zip && \
    rm -rf /var/lib/apt/lists/*


USER 1001


# Install the requirements
COPY requirements.txt ${APP_ROOT}/src
RUN cd ${APP_ROOT}/src && pip install --no-cache-dir -r requirements.txt
