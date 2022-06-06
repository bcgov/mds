FROM postgis/postgis:13-3.0

# The Git ref (branch/tag) specifying the version of oracle-fdw to use
# This is referencing a specific revision (master as of 2021.06.01)
# because there is not a tagged version that works with the 
# Oracle 21.x client libraries yet

ARG ORACLE_FDW_VERSION=3035e4453404a143b8154d7b77c6db793fad0e06
ARG oracle_fdw_version=2_1_0
ARG instantclient_version=21_6

# =================================== # 
# Packages for installing oracle FDW
# =================================== # 

# build-essential: meta-packages necessary for compiling software
# make: to run fdw installation make commands
# unzip: to extract packages
# wget: to download packages
# ca-certificates: for wget to connect securely 
# postgresql-server-dev-13: for oracle_fdw make command to work
# libaio1 libaio-dev: is need for oracle_fdw.so binary to work

# -y non-interactive : yes
# --no-install-recommends : Install only dependecies and not all recommended dependency 

RUN apt-get update && apt-get install -y --no-install-recommends \ 
    build-essential \
    make \
    unzip \
    wget \ 
    ca-certificates \ 
    postgresql-server-dev-13 \ 
    libaio1 \
    libaio-dev

# =================================== # 
# Download and Extract Oracle Client
# =================================== # 

RUN mkdir -p /pgexts/oraclelibs && cd /pgexts/oraclelibs && \
    wget -nv https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-basic-linux.x64-21.6.0.0.0dbru.zip && \
    wget -nv https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-sdk-linux.x64-21.6.0.0.0dbru.zip && \
    unzip "/pgexts/oraclelibs/*.zip" -d /pgexts/oraclelibs

# =================================== # 
# Set Paths for FDW to find oracle libraries
# =================================== # 

ENV ORACLE_HOME /pgexts/oraclelibs/instantclient_${instantclient_version}
ENV LD_LIBRARY_PATH /pgexts/oraclelibs/instantclient_${instantclient_version}

# =================================== # 
# Install Oracle FDW
# =================================== # 

RUN cd /pgexts && \
    wget -nv https://github.com/laurenz/oracle_fdw/archive/${ORACLE_FDW_VERSION}.tar.gz && \
    tar -xzf ${ORACLE_FDW_VERSION}.tar.gz && \
    cd oracle_fdw-${ORACLE_FDW_VERSION} && \
    make && \
    make install

# =================================== # 
# Remove Downloads
# =================================== # 

RUN rm -rf /pgexts/oraclelibs/*.zip /pgexts/${ORACLE_FDW_VERSION}.tar.gz /tmp/oracle_fdw-${ORACLE_FDW_VERSION}

# Init Scripts

COPY init.sql /docker-entrypoint-initdb.d/init.sql
COPY postgresql.conf      /tmp/postgresql.conf
COPY updateConfig.sh      /docker-entrypoint-initdb.d/_updateConfig.sh

# Set the working directory to container entrypoint
WORKDIR /docker-entrypoint-initdb.d
