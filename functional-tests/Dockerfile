FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER root

# For firefoxHeadLessTests
RUN dbus-uuidgen > /var/lib/dbus/machine-id

# Copy over the code
RUN mkdir /home/jenkins/bdd-tests
COPY . /home/jenkins/bdd-tests/
RUN chown -R 1001:0 /home/jenkins/bdd-tests

USER 1001
RUN cd /home/jenkins/bdd-tests && ./gradlew -m

USER root

# Fix permissions
RUN chown -R 1001:0 /home/jenkins/bdd-tests

USER 1001