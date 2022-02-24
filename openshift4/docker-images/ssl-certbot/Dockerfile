# cat Dockerfile | oc new-build -D - --name=certbot
FROM registry.access.redhat.com/ubi8:8.3-227

RUN set -x && \
    echo -e '[main]\nenabled=0\ndisable_system_repos=1' > /etc/yum/pluginconf.d/subscription-manager.conf && \
    yum install -y yum-utils python36 && \
    pip3 install --no-cache-dir --upgrade setuptools pip wheel && \
    pip3 install --no-cache-dir 'certbot==1.21.0' && \
    mkdir -p /var/log/letsencrypt && \
    chgrp -R 0 /var/log/letsencrypt && \
    chmod -R ugo+rwX /var/log/letsencrypt && \
    mkdir -p /var/lib/letsencrypt && \
    chgrp -R 0 /var/lib/letsencrypt && \
    chmod -R ugo+rwX /var/lib/letsencrypt && \
    mkdir -p /etc/letsencrypt && \
    chgrp -R 0 /etc/letsencrypt && \
    chmod -R ugo+rwX /etc/letsencrypt && \
    yum clean all -y && \
    certbot --version && \
    certbot --help paths

RUN set -x && \
    yum install -y https://mirror.csclub.uwaterloo.ca/fedora/epel/epel-release-latest-7.noarch.rpm && \
    yum install '--disablerepo=*' '--enablerepo=epel' -y jq && \
    curl -sfL https://downloads-openshift-console.apps.silver.devops.gov.bc.ca/amd64/linux/oc.tar -o /tmp/openshift-origin-client-tools.tar && \
    tar -xvf /tmp/openshift-origin-client-tools.tar -C /usr/local/bin  && \
    rm /tmp/openshift-origin-client-tools.tar && \
    yum clean all -y

COPY oc-deploy-certs.sh /usr/local/bin/oc-deploy-certs.sh
RUN chmod g+w /usr/local/bin/oc-deploy-certs.sh

ENTRYPOINT ["/usr/local/bin/oc-deploy-certs.sh"]