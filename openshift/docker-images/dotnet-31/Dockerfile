FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

RUN export LD_LIBRARY_PATH=/lib64/ 

RUN yum install -y glibc-devel

RUN yum install -y wget
RUN wget http://mirror.centos.org/centos/7/os/x86_64/Packages/libX11-devel-1.6.7-2.el7.x86_64.rpm
RUN yum install -y libX11-devel
# RUN yum install libgdiplus

RUN wget http://archive.fedoraproject.org/pub/archive/fedora/linux/releases/9/Fedora/source/SRPMS/libgdiplus-1.9-4.fc9.src.rpm


# RUN wget http://download-ib01.fedoraproject.org/pub/epel/7/x86_64/
# RUN rpm -Uvh epel-release*rpm
# RUN yum install -y libgdiplus

USER 1001

RUN rpm -Uvh libgdiplus-1.9-4.fc9.src.rpm

# RUN dotnet run
