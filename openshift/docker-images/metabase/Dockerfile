FROM openjdk:8-jdk-alpine

WORKDIR /app

ENV FC_LANG en-US
ENV LC_CTYPE en_US.UTF-8

RUN apk add --update bash git wget make gettext ttf-dejavu fontconfig java-cacerts

# add Metabase jar
RUN wget -q http://downloads.metabase.com/v0.33.4/metabase.jar

# create the plugins directory, with writable permissions
RUN chmod -R 777 /app

# expose our default runtime port
EXPOSE 3000

# run it
CMD ["java", "-jar", "metabase.jar"]