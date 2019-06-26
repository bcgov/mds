FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Declare environment variables for Gradle and BDD Tests
ENV HOME=/home/seluser
ENV APP_HOME=/opt
ENV BDD_TEST_HOME=/opt/selenium/bdd-tests
ENV GRADLE_USER_HOME=/opt/gradle/gradle-4.10.3

USER root

# Download gradle to allow running as daemon and cache artifacts
RUN mkdir /opt/gradle
WORKDIR /opt/gradle
RUN wget -q https://services.gradle.org/distributions/gradle-4.10.3-bin.zip
RUN unzip -d /opt/gradle gradle-4.10.3-bin.zip
ENV PATH=$PATH:/opt/gradle/gradle-4.10.3/bin

# Copy over the test code and run a gradle build to cache runtime dependencies
RUN mkdir $BDD_TEST_HOME/
COPY . $BDD_TEST_HOME/

RUN cd $BDD_TEST_HOME && ./gradlew -m

# Fix permissions
RUN chmod -R 777 $APP_HOME

WORKDIR $HOME