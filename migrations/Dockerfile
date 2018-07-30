FROM registry.access.redhat.com/rhel7:7.5-409

ENV FLYWAY_VERSION=5.1.4

ENV FLYWAY_HOME=/opt/flyway/$FLYWAY_VERSION  \
    FLYWAY_PKGS="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"


LABEL com.redhat.component="flyway" \
      io.k8s.description="Platform for upgrading database using flyway" \
      io.k8s.display-name="DB Migration with flyway	" \
      io.openshift.tags="builder,sql-upgrades,flyway,db,migration"


RUN apk add --update \
       openjdk8-jre \
        wget \
        bash

# Download and flyway
RUN wget --no-check-certificate  $FLYWAY_PKGS &&\
   mkdir -p $FLYWAY_HOME && \
   mkdir -p /var/flyway/data  && \
   tar -xzf flyway-commandline-$FLYWAY_VERSION.tar.gz -C $FLYWAY_HOME  --strip-components=1

# Copy over the SQL scripts
COPY sql/* $FLYWAY_HOME/sql/

#ENTRYPOINT  cp -f /var/flyway/data/*.sql  $FLYWAY_HOME/sql/ && \
#            $FLYWAY_HOME/flyway  baseline migrate info  -user=${DB_USER} -password=${DB_PASSWORD} -url=${DB_URL}
