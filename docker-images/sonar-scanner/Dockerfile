FROM registry.access.redhat.com/rhel7:7.5-409


#based on https://github.com/sclorg/rhscl-dockerfiles/blob/master/rhel7.devtoolset-4-toolchain/Dockerfile
#based on https://github.com/sclorg/rhscl-dockerfiles/tree/master/rhel7.s2i-base
#   https://access.redhat.com/containers/?tab=images#/registry.access.redhat.com/rhscl/s2i-base-rhel7


#Switch to root user
USER 0
COPY ./contrib/ /opt/app-root

# use bellow for list repositories
#RUN yum repolist all
# Add Java
#RUN yum install -y --enablerepo=rhel-7-server-extras-rpm,rhel-server-rhscl-7-rpms java-1.8.0-openjdk

RUN set -x && \
    yum install -y --enablerepo=rhel-7-server-extras-rpm,rhel-server-rhscl-7-rpms unzip rh-git29 scl-utils && \
    curl -sLo /tmp/sonar-scanner-cli.zip https://sonarsource.bintray.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-3.2.0.1227-linux.zip && \
    mkdir /opt/sonar-scanner-cli && unzip -q /tmp/sonar-scanner-cli.zip -d /opt/sonar-scanner-cli && \
    mv /opt/sonar-scanner-cli /opt/_sonar-scanner-cli && mv /opt/_sonar-scanner-cli/sonar-scanner-3.2.0.1227-linux /opt/sonar-scanner-cli && rm -rf /opt/_sonar-scanner-cli \
    rm /tmp/sonar-scanner-cli.zip && \
    chmod -R 755 /opt/sonar-scanner-cli && \
    rm -rf /var/cache/yum && yum clean all && rm -rf /var/cache/yum && \
    echo "source scl_source enable rh-git29" >> /opt/app-root/etc/scl_enable

ENV HOME=/opt/app-root/src \
    PATH=/opt/app-root/src/bin:/opt/app-root/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

RUN mkdir -p ${HOME} && \
    groupadd -r default -f -g 1001 && \
    useradd -u 1001 -r -g default -d ${HOME} -s /sbin/nologin \
    -c "Default Application User" default && \
    chown -R 1001:1001 /opt/app-root && \
    chmod u+x /opt/app-root/bin/usage

#switch back to default user
USER 1001
WORKDIR ${HOME}

# Use entrypoint so path is correctly adjusted already at the time the command
# is searching, so something like docker run IMG gcc runs binary from SCL.
ADD contrib/bin/container-entrypoint /usr/bin/container-entrypoint

# Install the usage script with base image usage informations
ADD contrib/bin/usage /usr/local/bin/usage

ADD contrib/etc/scl_enable /opt/app-root/etc/scl_enable

# Enable the SCL for all bash scripts.
ENV BASH_ENV=/opt/app-root/etc/scl_enable \
    ENV=/opt/app-root/etc/scl_enable \
    PROMPT_COMMAND=". /opt/app-root/etc/scl_enable"

ENTRYPOINT ["container-entrypoint"]

CMD ["usage"]