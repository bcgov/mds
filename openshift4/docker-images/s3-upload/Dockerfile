FROM minio/mc:RELEASE.2021-09-23T05-44-03Z
COPY run_minio.sh .
COPY test_file.txt .
ENTRYPOINT ["/usr/bin/sh"]
CMD ["./run_minio.sh"]