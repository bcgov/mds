FROM docker.elastic.co/logstash/logstash:6.7.0
RUN rm -f /usr/share/logstash/

# Re-Install logstash
USER root
RUN curl -Lo - https://artifacts.elastic.co/downloads/logstash/logstash-6.7.0.tar.gz | \
    tar zxf - -C /usr/share && \
    mv /usr/share/logstash-6.7.0 /usr/share/logstash && \
    chmod -R g=u /usr/share/logstash && \
    find /usr/share/logstash -type d -exec chmod g+s {} \; && \
    ln -s /usr/share/logstash /opt/logstash

RUN mkdir -p /usr/share/logstash/dictionaries
COPY dictionaries /usr/share/logstash/dictionaries

COPY pipeline/ /usr/share/logstash/pipeline/
COPY config/ /usr/share/logstash/config/

# Fix directory permissions
RUN chmod -R 777 /usr/share/logstash