FROM amazon/aws-cli:2.0.6
RUN yum install jq -y

USER 0
WORKDIR /aws/
COPY run_upload.sh /aws/
COPY test_file.txt /aws/

# Fix file permissions in app-root for openshift compatibility (requires usergroup to be root)
RUN chgrp -R 0 /aws/ && \
    chmod -R g=u /aws/
# arbitrary user for kubernetes runtime compatibility
RUN chown -R 1001:0 /aws/
USER 1001

ENTRYPOINT ["/usr/bin/sh"]
# CMD ["./run_upload.sh"]