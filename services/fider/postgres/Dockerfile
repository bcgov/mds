FROM postgis/postgis:13-3.0

RUN export DEBIAN_FRONTEND=noninteractive && apt-get update && apt-get install -y --no-install-recommends \ 
    make \
    unzip \
    wget \ 
    ca-certificates \ 
    postgresql-contrib

# Init Scripts

COPY init.sql /docker-entrypoint-initdb.d/init.sql
COPY postgresql.conf      /tmp/postgresql.conf
COPY updateConfig.sh      /docker-entrypoint-initdb.d/_updateConfig.sh

# Set the working directory to container entrypoint
WORKDIR /docker-entrypoint-initdb.d
