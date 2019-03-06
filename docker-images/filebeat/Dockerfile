# get official filebeat image
FROM docker.elastic.co/beats/filebeat:6.6.1

# copy filebeat configuration
COPY filebeat.yml /usr/share/filebeat/filebeat.yml

# copy nginx module configuration
COPY nginx.yml /usr/share/filebeat/modules.d/nginx.yml

USER root

# create directory to monitor access logs
RUN mkdir -p /usr/share/filebeat/nginx
COPY test/access.log /usr/share/filebeat/nginx/access.log

RUN chown root:filebeat /usr/share/filebeat/filebeat.yml && chmod go-w /usr/share/filebeat/filebeat.yml
RUN chown root:filebeat /usr/share/filebeat/modules.d/nginx.yml && chmod go-w /usr/share/filebeat/modules.d/nginx.yml

# enable nginx module
USER filebeat modules enable nginx
USER filebeat