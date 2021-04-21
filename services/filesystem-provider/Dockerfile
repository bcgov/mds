FROM mcr.microsoft.com/dotnet/core/sdk:2.1

COPY ej2-amazon-s3-aspcore-file-provider ${APP_ROOT}/src

COPY init.sh .

ENTRYPOINT [ "./init.sh" ]
