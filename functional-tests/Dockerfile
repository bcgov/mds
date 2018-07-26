FROM openshift/jenkins-slave-bddstack

USER root

RUN mkdir /var/bdd-tests

COPY . /var/bdd-tests/

RUN chmod -R 777 /var/bdd-tests

USER 1001