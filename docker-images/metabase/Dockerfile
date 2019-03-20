FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

# Twiddle the permissions on ensure things can be run as an arbitrary user.
RUN chown -R 1001:0 /app && \
    chmod -R ug+rwx /app

USER 1001

# run it
ENTRYPOINT ["/app/bin/start"]