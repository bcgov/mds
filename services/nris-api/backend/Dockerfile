FROM python:3.11.7

ENV LD_LIBRARY_PATH="/opt/oracle/instantclient:${LD_LIBRARY_PATH}" \
    PATH="/opt/oracle/instantclient:${PATH}" \
    OCI_HOME="/opt/oracle/instantclient" \
    OCI_LIB_DIR="/opt/oracle/instantclient" \
    OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"

RUN curl -o instantclient-basic-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip
RUN curl -o instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip
RUN curl -o instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip

RUN apt-get update
RUN BUILD_PACKAGES="build-essential unzip curl libaio1 git" && \
    apt-get install -y $BUILD_PACKAGES

RUN mkdir -p opt/oracle && \
    unzip instantclient-basic-linux.x64-19.8.0.0.0dbru.zip -d /opt/oracle && \
    unzip instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip -d /opt/oracle && \
    unzip instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip -d /opt/oracle && \
    mv /opt/oracle/instantclient_19_8 /opt/oracle/instantclient && \
    echo '/opt/oracle/instantclient/' | tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && ldconfig && \
    rm -rf instantclient-basic-linux.x64-19.8.0.0.0dbru.zip instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip && \
    rm -rf /var/lib/apt/lists/*

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Oracle config files
RUN mkdir -p /opt/app-root/src/wallet
COPY cwallet.sso /opt/app-root/src/wallet
COPY sqlnet.ora /opt/app-root/src/wallet

ENV PYTHONUNBUFFERED=1

# Run the server
EXPOSE 5500
CMD ["flask","run"]