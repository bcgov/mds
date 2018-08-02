FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV FLYWAY_VERSION=5.1.4

ENV FLYWAY_HOME=/opt/flyway/$FLYWAY_VERSION  \
    FLYWAY_PKGS="https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/${FLYWAY_VERSION}/flyway-commandline-${FLYWAY_VERSION}.tar.gz"

# Download and flyway
RUN curl -sLo ./flyway-commandline-${FLYWAY_VERSION}.tar.gz $FLYWAY_PKGS &&\
   mkdir -p $FLYWAY_HOME && \
   mkdir -p /var/flyway/data  && \
   tar -xzf flyway-commandline-$FLYWAY_VERSION.tar.gz -C $FLYWAY_HOME  --strip-components=1

# Copy over the SQL scripts
COPY sql/* $FLYWAY_HOME/sql/

RUN chmod -R 777 $FLYWAY_HOME