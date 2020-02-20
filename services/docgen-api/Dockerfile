FROM node:8

WORKDIR /tmp
RUN wget http://downloadarchive.documentfoundation.org/libreoffice/old/6.3.3.1/deb/x86_64/LibreOffice_6.3.3.1_Linux_x86-64_deb.tar.gz -O libo.tar.gz
RUN apt update \
  && apt install -y libxinerama1 libfontconfig1 libdbus-glib-1-2 libcairo2 libcups2 libglu1-mesa libsm6 unzip \
  && tar -zxvf libo.tar.gz
WORKDIR LibreOffice_6.3.3.1_Linux_x86-64_deb/DEBS
RUN dpkg -i *.deb

RUN mkdir /tmp-reports
COPY . /app
WORKDIR /app
RUN yarn