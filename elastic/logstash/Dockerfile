FROM docker.elastic.co/logstash/logstash:6.7.0
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/
COPY uid_entrypoint /usr/local/bin

# Fix directory permissions
USER root
RUN chmod g+w /etc/passwd
RUN usermod -u 1002510000 logstash

USER 1002510000