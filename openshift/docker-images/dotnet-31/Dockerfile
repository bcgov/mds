FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

# METHOD 1
# I got this working locally.
# https://www.syncfusion.com/forums/162040/the-type-initializer-for-syncfusion-ej2-pdfviewer-pdfiumnative-threw-an-exception
# NOTE: It looks like they referenced here: https://github.com/dotnet/dotnet-docker/issues/618
#
# RUN ln -s /lib/x86_64-linux-gnu/libdl-2.24.so /lib/x86_64-linux-gnu/libdl.so
# # Install System.Drawing native dependencies
# RUN apt-get update && apt-get install -y --allow-unauthenticated libgdiplus libc6-dev libx11-dev
# RUN ln -s libgdiplus.so gdiplus.dll

# METHOD 2
# I got this working locally.
# https://www.syncfusion.com/forums/150491/typeerror-cannot-read-property-ej2-instances-of-null-when-navigating-away-from
#
# RUN apt-get update \
#     && apt-get install -y --allow-unauthenticated \
#         libc6-dev \
#         libgdiplus \
#         libx11-dev \
#         curl \
#         vim \
#         supervisor \
#         procps

# https://www.mono-project.com/download/stable/#download-lin-centos
# https://docs.microsoft.com/en-us/dotnet/core/install/linux-rhel#rhel-7--net-core-31
# https://docs.microsoft.com/en-us/dotnet/core/install/linux-rhel#dependencies
# Can't access this: https://access.redhat.com/solutions/4582971
# Install Mono
RUN yum install -y curl
RUN rpmkeys --import "http://pool.sks-keyservers.net/pks/lookup?op=get&search=0x3fa7e0328081bff6a14da29aa6a19b38d3d831ef"
RUN su -c 'curl https://download.mono-project.com/repo/centos7-stable.repo | tee /etc/yum.repos.d/mono-centos7-stable.repo'
RUN yum install mono-devel

# Trying to convert METHOD 2 to RHEL syntax/packages:
RUN yum install -y \
    glibc-devel \
    libgdiplus \
    libX11-devel.x86_64
# curl \
# vim \
# supervisor \
# procps


USER 1001
