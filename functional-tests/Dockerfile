FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV HOME=/home/seluser
ENV GRADLE_USER_HOME=/opt/selenium/bdd-tests/gradle_home

USER root

RUN mkdir /opt/selenium/bdd-tests
COPY . /opt/selenium/bdd-tests/

WORKDIR $HOME