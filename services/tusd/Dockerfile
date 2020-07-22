FROM tusproject/tusd:latest

USER 0

RUN apk add --update bash python3

# Install Python and pip3
RUN echo "**** install Python ****" && \
    if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi && \
    \
    echo "**** install pip ****" && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools wheel && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi

COPY init.sh .
COPY hooks ./hooks

# Install the python requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

USER 1001

ENTRYPOINT [ "./init.sh" ]
