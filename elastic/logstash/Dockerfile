FROM docker.elastic.co/logstash/logstash:6.7.0
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/
COPY uid_entrypoint.sh /usr/local/bin/uid_entrypoint.sh

# Fix directory permissions
USER root
RUN chgrp 0 /usr/local/bin/uid_entrypoint.sh && \
    chmod g=u /etc/passwd && \
    chmod 0775 /usr/local/bin/uid_entrypoint.sh

ENTRYPOINT ["/usr/local/bin/uid_entrypoint"]