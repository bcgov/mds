FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Declare environment variables for Gradle and BDD Tests
ENV HOME=/home/seluser
ENV APP_HOME=/opt
ENV BDD_TEST_HOME=/opt/selenium/bdd-tests
ENV GRADLE_USER_HOME=/opt/selenium/bdd-tests/gradle_home

USER root

# Copy over the test code and run a gradle build to cache runtime dependencies
RUN mkdir $BDD_TEST_HOME/
COPY . $BDD_TEST_HOME/

# Fix permissions
RUN chmod -R 777 $BDD_TEST_HOME

WORKDIR $HOME