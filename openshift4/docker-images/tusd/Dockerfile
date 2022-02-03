FROM "__FROM_IMAGE_STREAM_DEFINED_IN_TEMPLATE__"

COPY init.sh .

RUN mkdir -p /srv/tusd-data/data
RUN chgrp -R 0 /srv/tusd-data/data && \
    chmod -R g=u /srv/tusd-data/data

ENTRYPOINT [ "./init.sh" ]

USER 1000
RUN chown -R 1000:0 /srv/tusd-data/data