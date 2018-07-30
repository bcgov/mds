FROM registry.access.redhat.com/rhel7:7.5-409

USER 0

ENV FLYWAY_VERSION=5.1.4

ENV FLYWAY_HOME=/opt/flyway/$FLYWAY_VERSION  \
    FLYWAY_PKGS="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"

# Install java, wget and bash
RUN yum install -y --enablerepo=rhel-7-server-extras-rpm,rhel-server-rhscl-7-rpms java-1.8.0-openjdk wget bash

# Download and flyway
RUN wget --no-check-certificate  $FLYWAY_PKGS &&\
   mkdir -p $FLYWAY_HOME && \
   mkdir -p /var/flyway/data  && \
   tar -xzf flyway-commandline-$FLYWAY_VERSION.tar.gz -C $FLYWAY_HOME  --strip-components=1

# Copy over the SQL scripts
COPY sql/* $FLYWAY_HOME/sql/

USER 1001

#ENTRYPOINT  cp -f /var/flyway/data/*.sql  $FLYWAY_HOME/sql/ && \
#            $FLYWAY_HOME/flyway  baseline migrate info  -user=${DB_USER} -password=${DB_PASSWORD} -url=${DB_URL}