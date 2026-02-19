# Stage 1: Build
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:7.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ej2-amazon-s3-aspcore-file-provider/ .
RUN dotnet restore -a $TARGETARCH
RUN dotnet publish -c Release -o /app -a $TARGETARCH --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:7.0
USER 0

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libc6-dev \
    libgdiplus \
    libx11-dev \
    curl \
    supervisor \
    procps \
    && rm -rf /var/lib/apt/lists/*

RUN ln -s /lib/x86_64-linux-gnu/libdl.so.2 /lib/x86_64-linux-gnu/libdl.so || true
RUN ln -s /usr/lib/libgdiplus.so /usr/lib/gdiplus.dll || true

WORKDIR /app
COPY --from=build /app .
COPY init.sh /app/init.sh
RUN chmod +x /app/init.sh

# Provide user permissions to temp dotnet workspace
RUN mkdir /.dotnet && chmod -R 770 /.dotnet && chown -R 1001:0 /.dotnet
ENV DOTNET_CLI_HOME /.dotnet
ENV XDG_DATA_HOME /.dotnet

RUN chmod -R 770 /app && chown -R 1001:0 /app

USER 1001
EXPOSE 62870
ENTRYPOINT [ "./init.sh" ]