FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN curl https://dl.fedoraproject.org/pub/epel/epel-release-latest-8.noarch.rpm --output epel-release
RUN yum install -y glibc-devel epel-release mono-complete

USER 1001
