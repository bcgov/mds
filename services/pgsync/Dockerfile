
FROM --platform=linux/amd64 python:3.12.11-bookworm

RUN pip install --no-cache-dir pgsync==7.0.5

WORKDIR /app
USER root

COPY start.sh /app/start.sh
COPY schema.json /config/schema.json
RUN chmod +x /app/start.sh
RUN chmod 777 /app

ENTRYPOINT ["/app/start.sh"]
