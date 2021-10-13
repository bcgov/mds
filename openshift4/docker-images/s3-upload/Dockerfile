FROM minio/mc:RELEASE.2021-09-23T05-44-03Z
RUN mkdir /app
WORKDIR /app
COPY run_minio.sh /app/
COPY test_file.txt /app/
RUN chown -R 1000:1000 /app/
ENTRYPOINT ["/usr/bin/sh"]
CMD ["./run_minio.sh"]