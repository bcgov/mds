FROM openshift/jenkins-slave-bddstack

USER root

# For firefoxHeadLessTests
RUN dbus-uuidgen > /var/lib/dbus/machine-id

# Copy over the code
RUN mkdir /home/jenkins/bdd-tests
COPY . /home/jenkins/bdd-tests/
RUN chmod -R 777 /home/jenkins/bdd-tests

# Install gradle dependencies
RUN cd home/jenkins/bdd-tests/ && ./gradlew build -m

USER 1001