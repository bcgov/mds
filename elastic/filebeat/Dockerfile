# get official filebeat image
FROM docker.elastic.co/beats/filebeat:6.6.1

# Logstash host and port configuration (required)
ARG ES_LOGSTASH_HOST
ARG ES_LOGSTASH_PORT

# Set logstash host and port for configuration file
ENV ES_LOGSTASH_HOST=${ES_LOGSTASH_HOST}
ENV ES_LOGSTASH_PORT=${ES_LOGSTASH_PORT}

# copy filebeat configuration
COPY config/filebeat.yml /usr/share/filebeat/filebeat.yml

# copy nginx module configuration
COPY config/nginx.yml /usr/share/filebeat/modules.d/nginx.yml

USER root

COPY kibana /usr/share/filebeat/kibana/6/dahsboard

# copy dahsboard load
RUN mkdir /usr/share/filebeat/load
COPY config/load-dash.yml /usr/share/filebeat/load/load-dash.yml

# create directory to monitor access logs
RUN mkdir -p /var/monitor/access
RUN mkdir -p /var/monitor/error
COPY test/access.log /var/monitor/access/access.log



RUN chown root:filebeat /usr/share/filebeat/filebeat.yml && chmod go-w /usr/share/filebeat/filebeat.yml
RUN chown root:filebeat /usr/share/filebeat/modules.d/nginx.yml && chmod go-w /usr/share/filebeat/modules.d/nginx.yml
RUN chown root:filebeat /usr/share/filebeat/load/load-dash.yml && chmod go-w /usr/share/filebeat/load/load-dash.yml

# enable nginx module
USER filebeat modules enable nginx

# ENTRYPOINT [ "filebeat", "setup", "dashboards", "-c /usr/share/filebeata/load/load-dash.yml" ]

USER filebeat