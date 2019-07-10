FROM openjdk:8-alpine

# Update installation utility
RUN apk add --update bash git make curl gettext java-cacerts

# Install digdag
RUN wget -q -O /opt/digdag "https://dl.digdag.io/digdag-latest"
RUN chmod +x /opt/digdag
ENV PATH="/opt:$PATH"

# Create working directory
RUN mkdir /app
WORKDIR /app

COPY . .
RUN chmod +x /app/digdag-server.sh
RUN chmod -R 777 /app

# run it
CMD ["bash", "/app/digdag-server.sh" ]