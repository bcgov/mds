FROM openjdk:8-alpine
# Update installation utility
#RUN apt-get update && apt-get upgrade -y
RUN apk add --update bash

# Create working directory
RUN mkdir /app
WORKDIR /app

RUN wget -O /opt/digdag "https://dl.digdag.io/digdag-latest"
RUN chmod +x /opt/digdag

COPY . .
RUN chmod +x /app/digdag-server.sh /app/wait-for-it.sh

# run it
CMD ["bash", "/app/digdag-server.sh" ]
