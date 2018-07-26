FROM openshift/jenkins-slave-bddstack

USER root

ENV OPENSHIFT_JENKINS_JVM_ARCH=i386

COPY . /var/bdd-tests/

RUN chown -R 1001 /var/bdd-tests/

RUN ls -la

USER 1001