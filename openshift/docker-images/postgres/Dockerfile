FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER root

RUN cd /tmp && curl -o postgis.rpm -L https://yum.postgresql.org/10/redhat/rhel-7-x86_64/postgis30_10-3.0.3-7.rhel7.x86_64.rpm && yum localinstall postgis.rpm && rm postgis.rpm

USER postgres