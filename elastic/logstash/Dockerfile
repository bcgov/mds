FROM docker.elastic.co/logstash/logstash:6.6.2
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

# RUN mkdir -p /usr/share/logstash/templates
# COPY templates /usr/share/logstash/templates

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

# Install plugins
RUN logstash-plugin install logstash-output-amazon_es

# Fix directory permissions
#USER root
#RUN chmod -R 777 /usr/share/logstash