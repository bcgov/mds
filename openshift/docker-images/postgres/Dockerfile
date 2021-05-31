FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER root

# Copy entitlements
COPY ./etc-pki-entitlement /etc/pki/entitlement

# Copy subscription manager configurations
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

# Install some packages and clean up
RUN INSTALL_PKGS="postgis30_10" && \
    # Initialize /etc/yum.repos.d/redhat.repo
    # See https://access.redhat.com/solutions/1443553
    rm /etc/rhsm-host && \
    yum repolist > /dev/null && \
    yum install -y yum-utils gettext && \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    #yum repolist --disablerepo=* && \
    yum install -y --setopt=tsflags=nodocs $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    yum -y clean all --enablerepo='*' && \
    # Remove entitlements and Subscription Manager configs
    rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm

# RUN rm /etc/rhsm-host && \
#     yum repolist > /dev/null && \
#     yum install -y yum-utils gettext && \
#     yum-config-manager --disable \* &> /dev/null && \
#     yum-config-manager --enable rhel-server-rhscl-7-rpms && \
#     yum-config-manager --enable rhel-7-server-rpms && \
#     yum-config-manager --enable rhel-7-server-optional-rpms
# RUN cd /tmp && \
#     yum -y install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm && \
#     rpm -ivh https://download.postgresql.org/pub/repos/yum/reporpms/EL-6-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
#     subscription-manager repos --enable "rhel-*-optional-rpms" --enable "rhel-*-extras-rpms"  --enable "rhel-ha-for-rhel-*-server-rpms" && \
#     yum -y install https://yum.postgresql.org/10/redhat/rhel-7-x86_64/postgis30_10-3.0.3-7.rhel7.x86_64.rpm

# RUN cd /tmp \
#     && curl -o postgis.rpm -L https://yum.postgresql.org/10/redhat/rhel-7-x86_64/postgis30_10-3.0.3-7.rhel7.x86_64.rpm \
#     && yum localinstall postgis.rpm \
#     && rm postgis.rpm

USER postgres