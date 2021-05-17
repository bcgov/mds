FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

USER 0

# METHOD 1
# I got this working locally.
# https://www.syncfusion.com/forums/162040/the-type-initializer-for-syncfusion-ej2-pdfviewer-pdfiumnative-threw-an-exception
# RUN ln -s /lib/x86_64-linux-gnu/libdl-2.24.so /lib/x86_64-linux-gnu/libdl.so
# # Install System.Drawing native dependencies
# RUN apt-get update && apt-get install -y --allow-unauthenticated libgdiplus libc6-dev libx11-dev
# RUN ln -s libgdiplus.so gdiplus.dll

# METHOD 2
# I got this working locally.
# https://www.syncfusion.com/forums/150491/typeerror-cannot-read-property-ej2-instances-of-null-when-navigating-away-from
# RUN apt-get update \
#     && apt-get install -y --allow-unauthenticated \
#         libc6-dev \
#         libgdiplus \
#         libx11-dev \
#         curl \
#         vim \
#         supervisor \
#         procps

# Trying to convert METHOD 2 to RHEL syntax/packages:
RUN yum install -y \
    glibc-devel \
    libgdiplus \
    libX11-devel.x86_64 \
    curl \
    vim \
    supervisor \
    procps

USER 1001
