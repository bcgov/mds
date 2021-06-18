FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Copy entitlements and subscription manager configurations
# https://github.com/BCDevOps/OpenShift4-Migration/issues/15
COPY ./etc-pki-entitlement /etc/pki/entitlement
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

RUN INSTALL_PKGS="glibc-devel mono-complete" && \
    rm /etc/rhsm-host && \
    yum repolist --disablerepo=* && \
    yum install -y yum-utils gettext && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-eus-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && \
    yum install -y --setopt=tsflags=nodocs $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    yum -y clean all --enablerepo='*' && \
    # Remove entitlements and Subscription Manager configs
    rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm
