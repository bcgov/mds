FROM tusproject/tusd:v2.10.0

COPY init.sh .
COPY ./hooks/post-finish ./hooks/

USER root

RUN chmod +x ./hooks/post-finish

RUN apk add --no-cache curl \
    && apk add --no-cache aws-cli \
    && apk add --no-cache jq \
    && chmod +x ./hooks/post-finish

ENTRYPOINT [ "./init.sh" ]
