#!/bin/sh

cd /src
dotnet restore
dotnet add package DotNetEnv --version 2.0.0
dotnet build
dotnet run
