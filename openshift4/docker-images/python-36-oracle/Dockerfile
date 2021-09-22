FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV LD_LIBRARY_PATH="$APP_ROOT/oracle_bin/instantclient:${LD_LIBRARY_PATH}" \
    PATH="$APP_ROOT/oracle_bin/instantclient:${PATH}" \
    OCI_HOME="$APP_ROOT/oracle_bin/instantclient" \
    OCI_LIB_DIR="$APP_ROOT/oracle_bin/instantclient" \
    OCI_INCLUDE_DIR="$APP_ROOT/oracle_bin/instantclient/sdk/include"

RUN mkdir -p /tmp/oracle

RUN curl --connect-timeout 10 --max-time 60 --retry 5 --retry-delay 0 --retry-max-time 60 \
    -o /tmp/oracle/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip
RUN curl --connect-timeout 10 --max-time 60 --retry 5 --retry-delay 0 --retry-max-time 60 \
    -o /tmp/oracle/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip
RUN curl --connect-timeout 10 --max-time 60 --retry 5 --retry-delay 0 --retry-max-time 60 \
    -o /tmp/oracle/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip

RUN mkdir -p ${APP_ROOT}/oracle_bin

USER 0

RUN yum -y install libaio

RUN unzip /tmp/oracle/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip -d ${APP_ROOT}/oracle_bin && \
    unzip /tmp/oracle/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip -d ${APP_ROOT}/oracle_bin && \
    unzip /tmp/oracle/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip -d ${APP_ROOT}/oracle_bin && \
    mv ${APP_ROOT}/oracle_bin/instantclient_19_8 ${APP_ROOT}/oracle_bin/instantclient

RUN echo '/opt/app-root/oracle_bin/instantclient/' | tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && ldconfig && \
    rm -rf /tmp/oracle/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip /tmp/oracle/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip /tmp/oracle/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip && \
    rm -rf /var/lib/apt/lists/*

# Create wallet and config files
# COPY wallet $APP_ROOT/src/wallet
COPY sqlnet.ora $APP_ROOT/oracle_bin/instantclient/network/admin
RUN chmod 777 $APP_ROOT/oracle_bin/instantclient/network/admin/sqlnet.ora

RUN chmod g=u /etc/passwd
COPY fix_uid /usr/local/bin
RUN chmod +x /usr/local/bin/fix_uid

USER 1001

# Install project dependencies
COPY requirements.txt ${APP_ROOT}/src
RUN source /opt/app-root/etc/scl_enable && \
    set -x && \
    pip install -U pip setuptools wheel && \
    cd ${APP_ROOT}/src && pip install -r requirements.txt
