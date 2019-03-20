###################
# STAGE 1: builder
###################

FROM registry.access.redhat.com/redhat-openjdk-18/openjdk18-openshift:1.6-18

WORKDIR /app/source

ENV FC_LANG en-US
ENV LC_CTYPE en_US.UTF-8

# bash:    various shell scripts
# wget:    installing lein
# git:     ./bin/version
# yarn:  frontend building
# make:    backend building
# gettext: translations

RUN apk add --update bash yarn git wget make gettext

# lein:    backend dependencies and building
ADD https://raw.github.com/technomancy/leiningen/stable/bin/lein /usr/local/bin/lein
RUN chmod 744 /usr/local/bin/lein
RUN lein upgrade

# install dependencies before adding the rest of the source to maximize caching

# backend dependencies
ADD project.clj .
RUN lein deps

# frontend dependencies
ADD yarn.lock package.json .yarnrc ./
RUN yarn

# add the rest of the source
ADD . .

# build the app
RUN bin/build

# install updated cacerts to /etc/ssl/certs/java/cacerts
RUN apk add --update java-cacerts

# ###################
# # STAGE 2: runner
# ###################

WORKDIR /app

ENV FC_LANG en-US
ENV LC_CTYPE en_US.UTF-8

# dependencies
RUN apk add --update bash ttf-dejavu fontconfig

# add fixed cacerts
COPY /etc/ssl/certs/java/cacerts /usr/lib/jvm/default-jvm/jre/lib/security/cacerts

# add Metabase script and uberjar
RUN mkdir -p bin target/uberjar
COPY /app/source/target/uberjar/metabase.jar /app/target/uberjar/
COPY /app/source/bin/start /app/bin/

# create the plugins directory, with writable permissions
RUN mkdir -p /plugins
RUN chmod a+rwx /plugins

# Twiddle the permissions on ensure things can be run as an arbitrary user.
RUN chown -R 1001:0 /app && \
    chmod -R ug+rwx /app

# expose our default runtime port
EXPOSE 3000

USER 1001

# run it
ENTRYPOINT ["/app/bin/start"]