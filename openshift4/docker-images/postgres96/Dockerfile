FROM registry.access.redhat.com/rhel7

# PostgreSQL image for OpenShift with PostGIS extension.
# Volumes:
#  * /var/lib/psql/data   - Database cluster for PostgreSQL
# Environment:
#  * $POSTGRESQL_USER     - Database user name
#  * $POSTGRESQL_PASSWORD - User's password
#  * $POSTGRESQL_DATABASE - Name of the database to create
#  * $POSTGRESQL_ADMIN_PASSWORD (Optional) - Password for the 'postgres'
#                           PostgreSQL administrative account

# The Git ref (branch/tag) specifying the version of oracle-fdw to use
# This is referencing a specific revision (master as of 2021.06.01)
# because there is not a tagged version that works with the 
# Oracle 21.x client libraries yet
ARG ORACLE_FDW_VERSION=3035e4453404a143b8154d7b77c6db793fad0e06

ENV POSTGIS_EXTENSION=Y \
    PGCRYPTO_EXTENSION=Y \
    POSTGRESQL_VERSION=9.6 \
    POSTGRESQL_PREV_VERSION=9.5 \
    HOME=/var/lib/pgsql \
    PGUSER=postgres

ENV SUMMARY="PostgreSQL is an advanced Object-Relational database management system" \
    DESCRIPTION="PostgreSQL is an advanced Object-Relational database management system (DBMS). \
    The image contains the client and server programs that you'll need to \
    create, run, maintain and access a PostgreSQL DBMS server."

LABEL summary=$SUMMARY \
    description="$DESCRIPTION" \
    io.k8s.description="$DESCRIPTION" \
    io.k8s.display-name="PostgreSQL 9.6" \
    io.openshift.expose-services="5432:postgresql" \
    io.openshift.tags="database,postgresql,postgresql96,rh-postgresql96,postgis,postgis24" \
    name="rhscl/postgresql-96-rhel7" \
    com.redhat.component="rh-postgresql96-docker" \
    version="9.6" \
    release="1"

EXPOSE 5432

COPY openshift4/docker-images/postgres96/root/usr/libexec/fix-permissions /usr/libexec/fix-permissions

# Copy entitlements and subscription manager configurations
# https://github.com/BCDevOps/OpenShift4-Migration/issues/15
COPY ./etc-pki-entitlement /etc/pki/entitlement
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

# This image must forever use UID 26 for postgres user so our volumes are
# safe in the future. This should *never* change, the last test is there
# to make sure of that.
# rhel-7-server-ose-3.2-rpms is enabled for nss_wrapper until this pkg is
# in base RHEL
#
# We need to call 2 (!) yum commands before being able to enable repositories properly
# This is a workaround for https://bugzilla.redhat.com/show_bug.cgi?id=1479388
# Initialize /etc/yum.repos.d/redhat.repo
# See https://access.redhat.com/solutions/1443553
RUN rm /etc/rhsm-host && \
    yum repolist > /dev/null && \
    yum install -y yum-utils gettext && \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    INSTALL_PKGS="rsync tar gettext bind-utils rh-postgresql96 rh-postgresql96-postgresql-contrib nss_wrapper rh-postgresql96-postgresql-server rh-postgresql96-postgresql-devel" && \
    yum -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    localedef -f UTF-8 -i en_US en_US.UTF-8 && \
    test "$(id postgres)" = "uid=26(postgres) gid=26(postgres) groups=26(postgres)" && \
    mkdir -p /var/lib/pgsql/data && \
    /usr/libexec/fix-permissions /var/run/postgresql

# Install dev tools used to compile oracle_fdw
RUN yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-eus-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    yum -y groupinstall 'Development Tools' && \
    yum clean all

# Install dev tools used to compile oracle_fdw
RUN yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-eus-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    INSTALL_PKGS="wget libaio-devel" && \
    yum -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    yum clean all

# Get prefix path and path to scripts rather than hard-code them in scripts
ENV CONTAINER_SCRIPTS_PATH=/usr/share/container-scripts/postgresql \
    ENABLED_COLLECTIONS=rh-postgresql96

# When bash is started non-interactively, to run a shell script, for example it
# looks for this variable and source the content of this file. This will enable
# the SCL for all scripts without need to do 'scl enable'.
ENV BASH_ENV=${CONTAINER_SCRIPTS_PATH}/scl_enable \
    ENV=${CONTAINER_SCRIPTS_PATH}/scl_enable \
    PROMPT_COMMAND=". ${CONTAINER_SCRIPTS_PATH}/scl_enable"

VOLUME ["/var/lib/pgsql/data", "/var/run/postgresql"]

# Install the Oracle dependencies for oracle_fdw
RUN mkdir -p /tmp/oraclelibs && cd /tmp/oraclelibs && \
    wget -nv https://download.oracle.com/otn_software/linux/instantclient/211000/oracle-instantclient-basic-21.1.0.0.0-1.x86_64.rpm && \
    wget -nv https://download.oracle.com/otn_software/linux/instantclient/211000/oracle-instantclient-devel-21.1.0.0.0-1.x86_64.rpm && \
    rpm -Uvh oracle-instantclient-basic-21.1.0.0.0-1.x86_64.rpm && \
    rpm -Uvh oracle-instantclient-devel-21.1.0.0.0-1.x86_64.rpm

COPY openshift4/docker-images/postgres96/root /

ENV PGCONFIG /opt/rh/rh-postgresql96/root/usr/bin
ENV ORACLE_HOME /usr/lib/oracle/21/client64/lib
ENV PATH /opt/rh/rh-postgresql96/root/usr/bin/:${PATH}

# ====================================================================================
# Aquire and build the desired version of oracle_fdw
# ------------------------------------------------------------------------------------
RUN cd /tmp && \
    wget -nv https://github.com/laurenz/oracle_fdw/archive/${ORACLE_FDW_VERSION}.tar.gz && \
    tar -xzf ${ORACLE_FDW_VERSION}.tar.gz && \
    cd oracle_fdw-${ORACLE_FDW_VERSION} && \
    make && \
    make install && \
    rm -rf /tmp/oraclelibs /tmp/${ORACLE_FDW_VERSION}.tar.gz /tmp/oracle_fdw-${ORACLE_FDW_VERSION} /var/cache/yum
# ====================================================================================

# Aquire and build PostGIS 2.4, for PostgreSQL 9.6
RUN cd /tmp && \
    yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && \
    rpm -ivh https://download.postgresql.org/pub/repos/yum/reporpms/EL-6-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
    yum install -y postgis24_96 postgis24_96-client && \
    /usr/bin/install -c -m 755  /usr/pgsql-9.6/lib/postgis* '/opt/rh/rh-postgresql96/root/usr/lib64/pgsql/' && \
    /usr/bin/install -c -m 755  /usr/pgsql-9.6/lib/rtpostgis* '/opt/rh/rh-postgresql96/root/usr/lib64/pgsql/' && \
    /usr/bin/install -c -m 644 /usr/pgsql-9.6/share/extension/postgis* '/opt/rh/rh-postgresql96/root/usr/share/pgsql/extension/' && \
    mv /usr/pgsql-9.6/share/contrib/postgis-2.4/ /opt/rh/rh-postgresql96/root/usr/share/pgsql/contrib/ && \
    rm -rf /tmp/pgdg-redhat-repo-latest.noarch.rpm /var/cache/yum && \
    # Remove entitlements and Subscription Manager configs
    rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm && \
    /usr/libexec/fix-permissions /var/lib/pgsql

# Set the oracle library path
ENV LD_LIBRARY_PATH /usr/lib/oracle/21/client64/lib:${LD_LIBRARY_PATH}
USER 26

ENTRYPOINT ["container-entrypoint"]
CMD ["run-postgresql"]