FROM mcr.microsoft.com/dotnet/core/sdk:2.1

# https://github.com/SyncfusionExamples/ej2-amazon-s3-aspcore-file-provider
# https://ej2.syncfusion.com/documentation/file-manager/file-system-provider/#aspnet-core-amazon-s3-cloud-file-provider
# https://www.syncfusion.com/blogs/post/synchronize-amazon-s3-with-js-file-manager.aspx

COPY ej2-amazon-s3-aspcore-file-provider ${APP_ROOT}/src
COPY init.sh .

ENTRYPOINT [ "./init.sh" ]
