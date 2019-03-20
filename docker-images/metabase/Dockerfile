FROM openjdk:8-jdk-alpine

WORKDIR /app

ENV FC_LANG en-US
ENV LC_CTYPE en_US.UTF-8

RUN apk add --update bash git wget make gettext ttf-dejavu fontconfig

# install updated cacerts to /etc/ssl/certs/java/cacerts
RUN apk add --update java-cacerts

# add fixed cacerts
COPY /etc/ssl/certs/java/cacerts /usr/lib/jvm/default-jvm/jre/lib/security/cacerts

# add Metabase jar
RUN wget http://downloads.metabase.com/v0.31.2/metabase.jar

# create the plugins directory, with writable permissions
RUN mkdir -p /app/plugins
RUN chmod a+rwx /app/plugins

# expose our default runtime port
EXPOSE 3000

# run it
ENTRYPOINT ["java", "-jar", "metabase.jar"]