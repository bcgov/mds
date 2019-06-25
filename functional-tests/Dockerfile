FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV HOME=/home/seluser
ENV BDD_TEST_HOME=/opt/selenium/bdd-tests
ENV GRADLE_USER_HOME=/opt/selenium/bdd-tests/gradle_home

USER root

RUN mkdir $BDD_TEST_HOME/
COPY . $BDD_TEST_HOME/

RUN chmod -R 777 $BDD_TEST_HOME

WORKDIR $HOME