FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

ENV FLYWAY_VERSION=5.2.4

ENV FLYWAY_HOME=/opt/flyway/$FLYWAY_VERSION  \
    FLYWAY_PKGS="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"

# Download and extract flyway
RUN curl -sLo ./flyway-commandline-${FLYWAY_VERSION}.tar.gz $FLYWAY_PKGS &&\
    mkdir -p $FLYWAY_HOME && \
    mkdir -p /var/flyway/data  && \
    tar -xzf flyway-commandline-$FLYWAY_VERSION.tar.gz -C $FLYWAY_HOME  --strip-components=1


# Download and install postgres-client and envsubst utility
RUN yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm &&\
    yum install -y postgresql96 gettext

# Copy over the SQL files and scripts
COPY sql/* $FLYWAY_HOME/sql/
COPY scripts/* $FLYWAY_HOME/scripts/

RUN chmod -R 777 $FLYWAY_HOME

USER 1001