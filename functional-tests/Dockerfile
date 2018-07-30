FROM openshift/jenkins-slave-bddstack

USER root

RUN mkdir /home/jenkins/bdd-tests

COPY . /home/jenkins/bdd-tests/

RUN chmod -R 777 /home/jenkins/bdd-tests

USER 1001