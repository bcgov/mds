ARG ES_VERSION

# # get official filebeat image
FROM docker.elastic.co/beats/filebeat:${ES_VERSION}

# Logstash host and port configuration (required)
ARG ES_LOGSTASH_HOST
ARG ES_LOGSTASH_PORT

# Set logstash host and port for configuration file
ENV ES_LOGSTASH_HOST=${ES_LOGSTASH_HOST}
ENV ES_LOGSTASH_PORT=${ES_LOGSTASH_PORT}

COPY config/filebeat.yml /usr/share/filebeat/filebeat.yml
COPY config/nginx.yml /usr/share/filebeat/modules.d/nginx.yml
USER root

RUN mkdir -p /usr/share/filebeat/monitor/access/

RUN chgrp -R 0 /usr/share/filebeat/filebeat.yml \
    && chmod -R go-w /usr/share/filebeat/filebeat.yml \
    && chgrp -R 0 /usr/share/filebeat/modules.d/nginx.yml \
    && chmod -R go-w /usr/share/filebeat/modules.d/nginx.yml

USER filebeat
