FROM openjdk:8-alpine

# Install necessary packages
RUN apk add --update bash git make curl wget gettext java-cacerts tar gzip ca-certificates python3

ENV LANG=C.UTF-8

# Install GNU libc (aka glibc) for oc
RUN wget -q -O /etc/apk/keys/sgerrand.rsa.pub https://alpine-pkgs.sgerrand.com/sgerrand.rsa.pub && \
    wget -q https://github.com/sgerrand/alpine-pkg-glibc/releases/download/2.29-r0/glibc-2.29-r0.apk &&\
    apk add glibc-2.29-r0.apk

ENV OC_VERSION=v3.11.0 \
    OC_TAG_SHA=0cbc58b

# Install openshift CLI
RUN curl -sLo /tmp/oc.tar.gz https://github.com/openshift/origin/releases/download/${OC_VERSION}/openshift-origin-client-tools-${OC_VERSION}-${OC_TAG_SHA}-linux-64bit.tar.gz && \
    tar xzvf /tmp/oc.tar.gz -C /tmp/ && \
    mv /tmp/openshift-origin-client-tools-${OC_VERSION}-${OC_TAG_SHA}-linux-64bit/oc /usr/local/bin/ && \
    rm -rf /tmp/oc.tar.gz /tmp/openshift-origin-client-tools-${OC_VERSION}-${OC_TAG_SHA}-linux-64bit

# Install Python and pip3
RUN echo "**** install Python ****" && \
    if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi && \
    \
    echo "**** install pip ****" && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools wheel && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi

# Install digdag
RUN wget -q -O /opt/digdag "https://dl.digdag.io/digdag-latest"
RUN chmod +x /opt/digdag
ENV PATH="/opt:$PATH"

# Install Keycloak gatekeeper
RUN wget -q -O /tmp/gatekeeper.tar.gz https://downloads.jboss.org/keycloak/6.0.1/gatekeeper/keycloak-gatekeeper-linux-amd64.tar.gz && \
    tar xzvf /tmp/gatekeeper.tar.gz -C /tmp/ && \
    mv /tmp/keycloak-gatekeeper /usr/local/bin/ && \
    rm -rf /tmp/gatekeeper.tar.gz /tmp/keycloak-gatekeeper

# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy rest of the source
COPY . .
RUN chmod +x /app/digdag-init.sh
RUN chmod -R 777 /app

# Set the script to execute on container start
CMD ["bash", "/app/digdag-init.sh"]