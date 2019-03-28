FROM openjdk:8-jdk-alpine

WORKDIR /app

RUN apk add --update bash wget make java-cacerts

# Add Logstash itself.
RUN wget -q https://artifacts.elastic.co/downloads/logstash/logstash-6.7.0.tar.gz
RUN tar -zxf logstash-6.7.0.tar.gz -C /app
RUN mv /app/logstash-6.7.0 /app/logstash

ENV ELASTIC_CONTAINER false
ENV PATH=/app/logstash/bin:$PATH

COPY dictionaries /app/logstash/dictionaries

COPY pipeline/ /app/logstash/pipeline/
COPY config/ /app/logstash/config/

ADD bin/env2yaml /usr/local/bin/

# Ensure Logstash gets a UTF-8 locale by default.
ENV LANG='en_US.UTF-8' LC_ALL='en_US.UTF-8'

# create the plugins directory, with writable permissions
RUN chmod -R 777 /app

# expose our default runtime port
EXPOSE 9600 5044

# run it
ENTRYPOINT ["logstash"]