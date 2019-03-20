FROM docker.io/metabase/metabase:v0.31.2

# Twiddle the permissions on ensure things can be run as an arbitrary user.
RUN chown -R 1001:0 /app && \
    chmod -R ug+rwx /app

USER 1001

# run it
ENTRYPOINT ["/app/bin/start"]