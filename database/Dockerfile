FROM registry.access.redhat.com/rhscl/postgresql-96-rhel7:1-14

#Switch to root user
USER 0
RUN curl -sLo /tmp/flywaydb.tar.gz https://repo1.maven.org/maven2/org/flywaydb/flyway-commandline/5.1.4/flyway-commandline-5.1.4-linux-x64.tar.gz && \
    mkdir /opt/flywaydb && tar -xf /tmp/flywaydb.tar.gz --strip-components=1 -C /opt/flywaydb && \
    rm /tmp/flywaydb.tar.gz && \
    chmod -R 755 /opt/flywaydb
#switch back to default user
USER 26