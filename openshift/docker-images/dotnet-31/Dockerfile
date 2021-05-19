FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"
# This is the Dockerfile ^ : https://catalog.redhat.com/software/containers/ubi8/dotnet-31/5de595fa5a13461646f8bbb0?tag=3.1-26.20210331134246&gti-tabs=unauthenticated&container-tabs=dockerfile

USER 0

# METHOD 1 FROM:
# https://www.syncfusion.com/forums/162040/the-type-initializer-for-syncfusion-ej2-pdfviewer-pdfiumnative-threw-an-exception
# NOTE: It looks like they referenced here: https://github.com/dotnet/dotnet-docker/issues/618
#
# RUN ln -s /lib/x86_64-linux-gnu/libdl-2.24.so /lib/x86_64-linux-gnu/libdl.so
# # Install System.Drawing native dependencies
# RUN apt-get update && apt-get install -y --allow-unauthenticated libgdiplus libc6-dev libx11-dev
# RUN ln -s libgdiplus.so gdiplus.dll

# METHOD 2 FROM:
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
RUN rpmkeys --import "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x3FA7E0328081BFF6A14DA29AA6A19B38D3D831EF"
RUN su -c 'curl https://download.mono-project.com/repo/centos7-stable.repo | tee /etc/yum.repos.d/mono-centos7-stable.repo'
# RUN yum install mono-devel

# Trying to convert METHOD 2 to RHEL syntax/packages:
RUN yum install -y \
    krb5-libs \
    libicu \
    openssl-libs \
    zlib \
    glibc-devel \
    # libgdiplus \
    libX11-devel.x86_64 \
    mono-devel
# curl \
# vim \
# supervisor \
# procps


USER 1001
