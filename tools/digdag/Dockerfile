FROM openjdk:8-alpine
# Update installation utility
#RUN apt-get update && apt-get upgrade -y
#RUN apt-get install vim

# Create working directory
RUN mkdir /app
WORKDIR /app

RUN wget -O /opt/digdag "https://dl.digdag.io/digdag-latest"
RUN chmod +x /opt/digdag

COPY . .
RUN chmod +x /app/digdag-server.sh

# run it
CMD ["/app/digdag-server-sh" ]
