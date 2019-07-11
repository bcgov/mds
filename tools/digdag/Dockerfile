FROM openjdk:8-alpine

# Update installation utility
RUN apk add --update bash git make curl gettext java-cacerts

# Install Python and pip3
RUN echo "**** install Python ****" && \
    apk add --no-cache python3 && \
    if [ ! -e /usr/bin/python ]; then ln -sf python3 /usr/bin/python ; fi && \
    \
    echo "**** install pip ****" && \
    python3 -m ensurepip && \
    rm -r /usr/lib/python*/ensurepip && \
    pip3 install --no-cache --upgrade pip setuptools wheel && \
    if [ ! -e /usr/bin/pip ]; then ln -s pip3 /usr/bin/pip ; fi

# Install digdag
RUN wget -q -O /opt/digdag "https://dl.digdag.io/digdag-latest"
RUN chmod +x /opt/digdag
ENV PATH="/opt:$PATH"



# Create working directory
RUN mkdir /app
WORKDIR /app

# Install the requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chmod +x /app/digdag-server.sh
RUN chmod -R 777 /app

# run it
CMD ["bash", "/app/digdag-server.sh"]