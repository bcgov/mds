FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

# Copy entitlements and subscription manager configurations
# https://github.com/BCDevOps/OpenShift4-Migration/issues/15
COPY ./etc-pki-entitlement /etc/pki/entitlement
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

RUN INSTALL_PKGS="glibc-devel mono-complete" && \
    rm /etc/rhsm-host && \
    yum repolist > /dev/null && \
    yum install -y yum-utils gettext \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-8-rpms && \
    yum-config-manager --enable rhel-8-server-rpms && \
    yum-config-manager --enable rhel-8-server-optional-rpms && \
    yum -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    localedef -f UTF-8 -i en_US en_US.UTF-8 && \
    yum -y clean all --enablerepo='*'

# RUN curl https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm --output epel-release.rpm && \
#     yum install -y glibc-devel epel-release.rpm && \
#     yum install -y mono-complete

# Remove entitlements and Subscription Manager configs
RUN rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm

USER 1001
