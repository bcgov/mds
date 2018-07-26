FROM openshift/jenkins-slave-bddstack

USER root

COPY ../functional-tests /var/bdd-tests/

RUN chown -R 1001 /var/bdd-tests/

USER 1001