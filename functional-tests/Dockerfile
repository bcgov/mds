FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ENV HOME=/home/seluser

USER root

# Fix permissions
COPY .contrib/ /usr/local/bin

RUN chown -R :users /opt/selenium && \
    /usr/local/bin/fix-permissions /opt/selenium && \
    /usr/local/bin/fix-permissions $HOME

USER 1001

# Copy over the code
RUN mkdir /opt/selenium/bdd-tests
COPY . /opt/selenium/bdd-tests/

RUN mkdir /tmp/gradle
ENV GRADLE_USER_HOME=/tmp/gradle

RUN cd /opt/selenium/bdd-tests/ && ./gradlew -m

WORKDIR $HOME