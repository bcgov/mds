FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

COPY loki.yaml /etc/loki/loki.yaml

CMD ['--config.file=/etc/prometheus/prometheus.yaml', '--storage.tsdb.path=/prometheus', '--web.console.libraries=/usr/share/prometheus/console_libraries', '--web.console.templates=/usr/share/prometheus/consoles']

EXPOSE 9090