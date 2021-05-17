FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN yum install -y \
    epel-release \
    glibc-devel \
    libgdiplus \
    libX11-devel.x86_64 \
    curl \
    vim \
    supervisor \
    procps

USER 1001
