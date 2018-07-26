FROM openshift/jenkins-slave-bddstack

RUN mkdir -p /var/bdd-tests

WORKDIR /var/bdd-tests

COPY ../functional-tests /

ENTRYPOINT bash