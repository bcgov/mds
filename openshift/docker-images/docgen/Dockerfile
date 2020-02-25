FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

RUN wget https://mirror1.freemirror.org/tdf/libreoffice/stable/6.3.4/rpm/x86_64/LibreOffice_6.3.4_Linux_x86-64_rpm.tar.gz -O libo.tar.gz
RUN yum update \
    && yum install -y libxinerama1 libfontconfig1 libdbus-glib-1-2 libcairo2 libcups2 libglu1-mesa libsm6 unzip \
    && tar -zxvf libo.tar.gz
RUN rpm -ql LibreOffice_6.3.3.1_Linux_x86-64_rpm/RPMS/*.rpm
RUN mkdir /tmp-reports

COPY package.json ${APP_ROOT}/src
COPY yarn.lock ${APP_ROOT}/src

RUN cd ${APP_ROOT}/src && yarn

CMD ['node','index']
