# LICENSE UPL 1.0
#
# Copyright (c) 2014-2015 Oracle and/or its affiliates. All rights reserved.
#
# ORACLE DOCKERFILES PROJECT
# --------------------------
#
# Dockerfile template for Oracle Instant Client
#
# REQUIRED FILES TO BUILD THIS IMAGE
# ==================================
# 
# From http://www.oracle.com/technetwork/topics/linuxx86-64soft-092277.html
#  Download the following three RPMs:
#    - oracle-instantclient12.2-basic-12.2.0.1.0-1.x86_64.rpm
#    - oracle-instantclient12.2-devel-12.2.0.1.0-1.x86_64.rpm
#    - oracle-instantclient12.2-sqlplus-12.2.0.1.0-1.x86_64.rpm 
#
# HOW TO BUILD THIS IMAGE
# -----------------------
# Put all downloaded files in the same directory as this Dockerfile
# Run: 
#      $ docker build --pull -t oracle/instantclient:12.2.0.1 .
#
#
FROM oraclelinux:7-slim

# ADD oracle-instantclient*.rpm /tmp/
ADD http://mds-local-http:8080/data/oracle-instantclient12.2-basic-12.2.0.1.0-1.x86_64.rpm /tmp/
ADD http://mds-local-http:8080/data/oracle-instantclient12.2-devel-12.2.0.1.0-1.x86_64.rpm /tmp/
ADD http://mds-local-http:8080/data/oracle-instantclient12.2-sqlplus-12.2.0.1.0-1.x86_64.rpm /tmp/

# RUN curl --connect-timeout 10 --max-time 60 --retry 5 --retry-delay 0 --retry-max-time 60 \
#     -o /tmp/oracle/instantclient-basic-linux.x64-19.6.0.0.0dbru.zip 

RUN  yum -y install /tmp/oracle-instantclient*.rpm && \
    rm -rf /var/cache/yum && \
    rm -f /tmp/oracle-instantclient*.rpm && \
    echo /usr/lib/oracle/12.2/client64/lib > /etc/ld.so.conf.d/oracle-instantclient12.2.conf && \
    ldconfig

RUN mkdir -p /usr/lib/oracle/12.2/client64/lib/network/admin
COPY tnsnames.ora sqlnet.ora wallet /usr/lib/oracle/12.2/client64/lib/network/admin/

ENV PATH=$PATH:/usr/lib/oracle/12.2/client64/bin

CMD ["tail", "-f", "/dev/null"]