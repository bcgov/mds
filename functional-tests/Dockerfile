FROM openshift/jenkins-slave-bddstack

USER root

COPY . /var/bdd-tests/

RUN chmod -R 777 /var/bdd-tests/

RUN ls -la

USER 1001