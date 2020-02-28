FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

ARG APP_ROOT=/opt/app-root/src
ENV NO_UPDATE_NOTIFIER=true \
    PATH="/usr/lib/libreoffice/program:${PATH}" \
    PYTHONUNBUFFERED=1
WORKDIR ${APP_ROOT}

# Install LibreOffice & Common Fonts
RUN apk -U upgrade -a
RUN apk --no-cache add bash libreoffice util-linux \
    ttf-droid-nonlatin ttf-droid ttf-dejavu ttf-freefont ttf-liberation \
    && rm -rf /var/cache/apk/*
# Fix Python/LibreOffice Integration
COPY bindPython.sh ${APP_ROOT}/
COPY python ${APP_ROOT}/
RUN chmod a+rx ${APP_ROOT}/bindPython.sh \
    && ${APP_ROOT}/bindPython.sh

# Make temporary report directory
RUN mkdir /tmp/tmp-reports

# Install dependencies through yarn
COPY package.json yarn.lock ${APP_ROOT}/
RUN cd ${APP_ROOT} && yarn
RUN chmod -R 777 ${APP_ROOT}

USER 1001

EXPOSE 3030
