FROM openshift/jenkins-slave-bddstack

USER root

COPY . /var/bdd-tests/

RUN chown -R 1001 /var/bdd-tests/

RUN ls -la

USER 1001

# Stop container from exiting
CMD tail -f /dev/null