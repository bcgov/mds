#!/bin/sh

cd /src
dotnet restore
dotnet build
dotnet run
