FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

COPY prometheus.yaml /etc/prometheus/prometheus.yaml

CMD ['--config.file=/etc/prometheus/prometheus.yaml', '--storage.tsdb.path=/prometheus', '--web.console.libraries=/usr/share/prometheus/console_libraries', '--web.console.templates=/usr/share/prometheus/consoles']