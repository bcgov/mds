FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN export LD_LIBRARY_PATH=/lib64/ 

RUN yum install -y glibc-devel

RUN yum install -y wget
RUN wget http://mirror.centos.org/centos/7/os/x86_64/Packages/libX11-devel-1.6.7-2.el7.x86_64.rpm
RUN yum install -y libX11-devel

# Doesn't work. Cannot find package.
# RUN yum install libgdiplus

# Dont this this is working...
# RUN wget http://archive.fedoraproject.org/pub/archive/fedora/linux/releases/9/Fedora/source/SRPMS/libgdiplus-1.9-4.fc9.src.rpm
# RUN rpm -Uvh libgdiplus-1.9-4.fc9.src.rpm


RUN wget https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
RUN yum install -y epel-release-latest-7.noarch.rpm
RUN yum install -y libgdiplus

USER 1001
