FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# ENV LD_LIBRARY_PATH="/opt/oracle/instantclient" \
#     OCI_HOME="/opt/oracle/instantclient" \
#     OCI_LIB_DIR="/opt/oracle/instantclient" \
#     OCI_INCLUDE_DIR="/opt/oracle/instantclient/sdk/include"

# COPY /oracle/ .

# RUN BUILD_PACKAGES="build-essential unzip curl libaio1 python-minimal git" && \
#     apt-get install -y $BUILD_PACKAGES

# RUN mkdir -p opt/oracle && \
#     unzip instantclient-basic-linux.x64-19.3.0.0.0.zip -d /opt/oracle && \
#     unzip instantclient-sdk-linux.x64-19.3.0.0.0.zip -d /opt/oracle && \
#     mv /opt/oracle/instantclient_19_3 /opt/oracle/instantclient && \
#     echo '/opt/oracle/instantclient/' | tee -a /etc/ld.so.conf.d/oracle_instant_client.conf && ldconfig && \
#     rm -rf instantclient-basic-linux.x64-19.3.0.0.0.zip instantclient-sdk-linux.x64-19.3.0.0.0.zip && \
#     rm -rf /var/lib/apt/lists/*

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
