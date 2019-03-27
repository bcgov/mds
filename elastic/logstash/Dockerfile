FROM docker.elastic.co/logstash/logstash:6.7.0

# Re-install logstash
USER root
RUN rm -rf /usr/share/logstash/
RUN curl -Lo - https://artifacts.elastic.co/downloads/logstash/logstash-6.7.0.tar.gz | \
    tar zxf - -C /usr/share && \
    mv /usr/share/logstash-6.7.0 /usr/share/logstash && \
    ln -s /usr/share/logstash /opt/logstash

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

# Fix directory permissions
RUN chmod -R 777 /usr/share/logstash