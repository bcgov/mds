FROM minio/mc:RELEASE.2021-09-23T05-44-03Z

USER 0

RUN mkdir /app
RUN mkdir /app/.mc
WORKDIR /app
COPY run_minio.sh /app/
COPY test_file.txt /app/

# Fix file permissions in app-root for openshift compatibility (requires usergroup to be root)
RUN chgrp -R 0 /app/ && \
    chmod -R g=u /app/
# arbitrary user for kubernetes runtime compatibility
RUN chown -R 1001:0 /app/
USER 1001

ENTRYPOINT ["/usr/bin/sh"]
CMD ["./run_minio.sh"]