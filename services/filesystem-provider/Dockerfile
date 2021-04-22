FROM mcr.microsoft.com/dotnet/sdk:3.1

COPY ej2-amazon-s3-aspcore-file-provider ${APP_ROOT}/src

COPY init.sh .

RUN ln -s /lib/x86_64-linux-gnu/libdl-2.24.so /lib/x86_64-linux-gnu/libdl.so  
# Install System.Drawing native dependencies  
RUN apt-get update && apt-get install -y --allow-unauthenticated libgdiplus libc6-dev libx11-dev  
RUN ln -s libgdiplus.so gdiplus.dll 

ENTRYPOINT [ "./init.sh" ]
