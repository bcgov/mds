FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Declare environment variables for Gradle and BDD Tests
ENV BDD_TEST_HOME=/opt/selenium/bdd-tests

# Copy over the test code
RUN mkdir $BDD_TEST_HOME/
COPY . $BDD_TEST_HOME/

# Fix permissions
USER root
RUN chmod -R 777 $BDD_TEST_HOME

WORKDIR $BDD_TEST_HOME