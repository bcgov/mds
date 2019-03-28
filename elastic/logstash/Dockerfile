FROM openjdk:8-jdk-alpine

WORKDIR /app

USER 0
# Add packages
RUN apk add --update bash wget make java-cacerts go git musl-dev openssl

# Install env2yaml
ADD bin/env2yaml.go /tmp
WORKDIR /tmp
RUN go get gopkg.in/yaml.v2
RUN go build -o env2yaml
RUN cp /tmp/go/env2yaml /usr/local/bin

USER 1000

# Add Logstash.
RUN wget -q https://artifacts.elastic.co/downloads/logstash/logstash-6.7.0.tar.gz
RUN tar -zxf logstash-6.7.0.tar.gz -C /app
RUN mv /app/logstash-6.7.0 /app/logstash

WORKDIR /app

ENV ELASTIC_CONTAINER false
ENV PATH=/app/logstash/bin:$PATH

COPY dictionaries /app/logstash/dictionaries

COPY pipeline/ /app/logstash/pipeline/
COPY config/ /app/logstash/config/

# Ensure Logstash gets a UTF-8 locale by default.
ENV LANG='en_US.UTF-8' LC_ALL='en_US.UTF-8'

# create the plugins directory, with writable permissions
RUN chmod -R 777 /app

# expose our default runtime port
EXPOSE 9600 5044

# Place the startup wrapper script.
ADD bin/docker-entrypoint /usr/local/bin/
RUN chmod 0755 /usr/local/bin/docker-entrypoint

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
