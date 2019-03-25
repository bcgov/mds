ARG ES_VERSION

FROM docker.elastic.co/logstash/logstash:${ES_VERSION}
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/monitor

# copy dictionaries
RUN mkdir -p /usr/share/logstash/dictionaries
ADD dictionaries /usr/share/logstash/dictionaries

# copy tempate
RUN mkdir -p /usr/share/logstash/templates
ADD templates /usr/share/logstash/templates

ADD pipeline/ /usr/share/logstash/pipeline/
ADD config/ /usr/share/logstash/config/

