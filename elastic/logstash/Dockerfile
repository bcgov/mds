FROM openjdk:8-jdk-alpine

# Add packages
RUN apk add --update --no-cache bash wget make java-cacerts go git musl-dev openssl

# Install env2yaml
RUN mkdir -p /app/golang
WORKDIR /app/golang
COPY bin/env2yaml.go /app/golang
RUN go get gopkg.in/yaml.v2
RUN go build -o env2yaml
RUN cp /app/golang/env2yaml /usr/local/bin


# Add Logstash.
WORKDIR /app
RUN wget -q https://artifacts.elastic.co/downloads/logstash/logstash-6.7.0.tar.gz
RUN tar -zxf logstash-6.7.0.tar.gz -C /app
RUN mv /app/logstash-6.7.0 /app/logstash

ENV ELASTIC_CONTAINER false
ENV PATH=/app/logstash/bin:$PATH

# Add Postgres JDBC Driver
RUN mkdir /app/logstash/jdbc
WORKDIR /app/logstash/jdbc
RUN wget -q https://jdbc.postgresql.org/download/postgresql-42.2.5.jar
WORKDIR /app

# Add logstash config files
COPY dictionaries /app/logstash/dictionaries
COPY pipeline/ /app/logstash/pipeline/
COPY config/ /app/logstash/config/
COPY templates /app/logstash/templates

# Ensure Logstash gets a UTF-8 locale by default.
ENV LANG='en_US.UTF-8' LC_ALL='en_US.UTF-8'

# Update permissions to be accessible by randomly generated user ID
RUN chmod -R 0777 /app
ADD bin/docker-entrypoint /usr/local/bin/
RUN chmod 0755 /usr/local/bin/docker-entrypoint
RUN chmod 0755 /usr/local/bin/env2yaml

# Expose default runtime port
EXPOSE 9600

ENTRYPOINT ["/usr/local/bin/docker-entrypoint"]
