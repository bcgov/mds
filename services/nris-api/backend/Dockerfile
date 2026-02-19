FROM python:3.11.14-bookworm

ENV LD_LIBRARY_PATH="/opt/oracle/instantclient:${LD_LIBRARY_PATH}" \
    PATH="/opt/oracle/instantclient:${PATH}" \
    OCI_HOME="/opt/oracle/instantclient" \
    OCI_LIB_DIR="/opt/oracle/instantclient" \
    OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"

# Install tools and CA certificates before downloading Oracle Instant Client
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential unzip curl libaio1 git ca-certificates && \
    update-ca-certificates && \
    git config --system http.sslCAInfo /etc/ssl/certs/ca-certificates.crt && \
    rm -rf /var/lib/apt/lists/*

ENV SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt
ENV GIT_SSL_CAPATH=/etc/ssl/certs

# Download Oracle Instant Client archives (supporting optional insecure mode for corporate proxies)
ARG INSECURE_GIT=false
RUN if [ "$INSECURE_GIT" = "true" ]; then CURL_OPTS='-k'; else CURL_OPTS=''; fi && \
    curl $CURL_OPTS -o instantclient-basic-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-basic-linux.x64-19.8.0.0.0dbru.zip && \
    curl $CURL_OPTS -o instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sdk-linux.x64-19.8.0.0.0dbru.zip && \
    curl $CURL_OPTS -o instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip https://download.oracle.com/otn_software/linux/instantclient/19800/instantclient-sqlplus-linux.x64-19.8.0.0.0dbru.zip

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

# Optional: allow insecure Git SSL for corporate proxies
RUN if [ "$INSECURE_GIT" = "true" ]; then git config --system http.sslVerify false; fi

# Install the requirements
COPY requirements.txt .
# Constrain build backend dependencies for isolated builds
RUN echo "setuptools<70" > /tmp/constraints.txt
ENV PIP_CONSTRAINT=/tmp/constraints.txt
RUN pip install --no-cache-dir -r requirements.txt

# Oracle config files
RUN mkdir -p /opt/app-root/src/wallet
COPY cwallet.sso /opt/app-root/src/wallet
COPY sqlnet.ora /opt/app-root/src/wallet

ENV PYTHONUNBUFFERED=1

# Run the server
EXPOSE 5500
CMD ["flask","run"]