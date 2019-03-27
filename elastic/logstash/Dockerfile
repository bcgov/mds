FROM docker.elastic.co/logstash/logstash:6.7.0
RUN rm -f /usr/share/logstash/pipeline/logstash.conf

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

RUN logstash-plugin update logstash-output-elasticsearch

# Fix directory permissions
RUN chmod g+w /etc/passwd
COPY uid_entrypoint /usr/local/bin
RUN chown -R 1002510000:0 /usr/share/logstash && \
    chmod -R ug+rwx /usr/share/logstash

USER 1002510000

ENTRYPOINT [ "uid_entrypoint" ]