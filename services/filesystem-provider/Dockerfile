FROM mcr.microsoft.com/dotnet/sdk:7.0

USER 0

RUN apt-get update \     
    && apt-get install -y --allow-unauthenticated \     
    libc6-dev \     
    libgdiplus \     
    libx11-dev \     
    curl \     
    vim \     
    supervisor \     
    procps

COPY ej2-amazon-s3-aspcore-file-provider ${APP_ROOT}/app

COPY init.sh .

# Provide user permissions to temp dotnet workspace
RUN mkdir /.dotnet
RUN chmod -R 700 /.dotnet
RUN chown -R 1001:0 /.dotnet

ENV DOTNET_CLI_HOME /.dotnet
ENV XDG_DATA_HOME /.dotnet

RUN cd ${APP_ROOT}/app && dotnet restore && dotnet build

RUN chmod -R 700 ${APP_ROOT}/app
RUN chown -R 1001:0 ${APP_ROOT}/app


USER 1001
EXPOSE 62870
ENTRYPOINT [ "./init.sh" ]