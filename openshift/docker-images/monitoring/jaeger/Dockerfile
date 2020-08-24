FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Install Keycloak gatekeeper
RUN wget -q -O /tmp/gatekeeper.tar.gz https://downloads.jboss.org/keycloak/6.0.1/gatekeeper/keycloak-gatekeeper-linux-amd64.tar.gz && \
    tar xzvf /tmp/gatekeeper.tar.gz -C /tmp/ && \
    mv /tmp/keycloak-gatekeeper /usr/local/bin/ && \
    rm -rf /tmp/gatekeeper.tar.gz /tmp/keycloak-gatekeeper

# Copy rest of the source
COPY . .
RUN chmod +x docker-entrypoint.sh

# Set the script to execute on container start
ENTRYPOINT ["/docker-entrypoint.sh"]