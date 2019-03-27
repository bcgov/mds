FROM docker.elastic.co/logstash/logstash:6.7.0
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

# RUN mkdir -p /usr/share/logstash/templates
# COPY templates /usr/share/logstash/templates

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

# Fix directory permissions
#USER root
#RUN chmod -R 777 /usr/share/logstash