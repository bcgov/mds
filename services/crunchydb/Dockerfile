# This Dockerfile builds a custom image of the Crunchy Postgres GIS image with Oracle FDW support based on the BCGov crunchy-postgres image (https://github.com/bcgov/crunchy-postgres)
# We build the oracle_fdw extension from source in almalinux:8 and copy the built extension into the crunchydb image.
# Why almalinux? It is an Open Source RedHat Linux (RHEL) distribution, which means we can use open source build tools to build the extension.

# ================================== #
# Builder Stage
# This stage builds the oracle_fdw extension from source.
# It uses the almalinux:8 image to install the necessary build tools and dependencies.
# ================================== #
FROM almalinux:9 AS builder

USER root

# Set environment variables

ARG POSTGIS_LBL="16"
ARG POSTGIS_FULL_VER="3.5"
ARG PG_MAJOR="16"

ARG ORACLE_FDW_VERSION=ORACLE_FDW_2_6_0
ARG oracle_fdw_version=2_6_0
ARG instantclient_version=21_6

ENV ORACLE_HOME /var/lib/pgsql/oraclelibs/instantclient_${instantclient_version}
ENV LD_LIBRARY_PATH /var/lib/pgsql/oraclelibs/instantclient_${instantclient_version}
ENV PATH="$PATH:/usr/pgsql-16/bin"

# Install dependencies required to build oracle extension
RUN dnf module enable postgresql:16 -y
RUN dnf install -y\
    postgresql-server\
    redhat-rpm-config\
    postgresql-server-devel\
    unzip\
    gcc\
    make

# Download and extract Oracle client dependency
RUN mkdir -p /var/lib/pgsql/oraclelibs && cd /var/lib/pgsql/oraclelibs && \
    curl -L -O https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-basic-linux.x64-21.6.0.0.0dbru.zip && \
    curl -L -O https://download.oracle.com/otn_software/linux/instantclient/216000/instantclient-sdk-linux.x64-21.6.0.0.0dbru.zip && \
    unzip "/var/lib/pgsql/oraclelibs/*.zip" -d /var/lib/pgsql/oraclelibs

# Download and install oracle_fdw extension
WORKDIR /var/lib/pgsql
ADD https://github.com/laurenz/oracle_fdw/archive/refs/tags/${ORACLE_FDW_VERSION}.tar.gz .
RUN tar -xzf ${ORACLE_FDW_VERSION}.tar.gz
WORKDIR /var/lib/pgsql/oracle_fdw-${ORACLE_FDW_VERSION}
RUN make && \
    make install

### ================================= #
### CrunchyDB Postgres GIS Image with oracle_fdw extension
### Base image is maintained by the BCGov platform team
### https://github.com/bcgov/crunchy-postgres
### ================================= #
FROM artifacts.developer.gov.bc.ca/bcgov-docker-local/crunchy-postgres-gis:ubi8-16.6-3.4-0

ARG ORACLE_FDW_VERSION=ORACLE_FDW_2_6_0
ARG instantclient_version=21_6
ENV ORACLE_HOME /usr/pgsql-16/oraclelibs/instantclient_${instantclient_version}
ENV LD_LIBRARY_PATH /usr/pgsql-16/oraclelibs/instantclient_${instantclient_version}

USER root
RUN microdnf install -y libaio

# Copy oracle_fdw extension from builder stage
COPY --from=builder /var/lib/pgsql/oracle_fdw-${ORACLE_FDW_VERSION} /oracle
COPY --from=builder /var/lib/pgsql/oraclelibs /usr/pgsql-16/oraclelibs

RUN cp /oracle/oracle_fdw.so /usr/pgsql-16/lib/ && \
    cp /oracle/oracle_fdw.control /usr/pgsql-16/share/extension/ && \
    cp /oracle/oracle_fdw--*.sql /usr/pgsql-16/share/extension/

USER postgres
