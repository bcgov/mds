# ej2-amazon-s3-aspcore-file-provider

This repository contains the Amazon S3 bucket file system provider in ASP.NET Core for the Essential JS 2 File Manager component.

## Key Features

The following actions can be performed with Amazon S3 bucket file system provider:

| **Actions** | **Description** |
| --- | --- |
| Read         | Reads the files from Amazon S3 bucket. |
| Details      | Gets the file's details like Type, Size, Location, and Modified date. |
| Download     | Downloads the selected file or folder from the Amazon S3 bucket. |
| Upload       | Uploads a file to the Amazon S3 bucket. It accepts uploaded media with the following characteristics: <ul><li>Maximum file size:  30MB</li><li>Accepted Media MIME types: `*/*` </li></ul> |
| Create       | Creates a new folder. |
| Delete       | Deletes a folder or file. |
| Copy         | Copies the selected files from target. |
| Move         | Pastes the copied files to the desired location. |
| Rename       | Renames a folder or file. |
| Search       | Full-text queries perform linguistic searches against text data in full-text indexes by operating on words and phrases. |

## Prerequisites

To run the service, create an Amazon S3 bucket in one of the AWS Regions for accessing and storing the S3 objects as files or folders. Create an [Amazon S3 account](https://docs.aws.amazon.com/AmazonS3/latest/gsg/CreatingABucket.html) and then create S3 bucket to perform the file operations. Then, open the `AmazonS3FileProvider` and register your Amazon S3 client account details like awsAccessKeyId, awsSecretAccessKey, bucketRegion, and bucketName details in `RegisterAmazonS3` method to perform the file operations. 

```
  void RegisterAmazonS3(string bucketName, string awsAccessKeyId, string awsSecretAccessKey, string bucketRegion);
```

## How to run this application

To run this application, clone the [`ej2-amazon-s3-aspcore-file-provider`](https://github.com/ej2-amazon-s3-aspcore-file-provider) repository and then navigate to its appropriate path where it has been located in your system.

To do so, open the command prompt and run the following commands one after the other.

```
git clone https://github.com/ej2-amazon-s3-aspcore-file-provider   

cd ej2-amazon-s3-aspcore-file-provider
```
## Restore the NuGet package and build the application

To restore the NuGet package, run the following command in root folder of the application.

```
dotnet restore
```

To build the application, run the following command.

```
dotnet build
```

## Running application

After successful compilation, run the following command to run the application.

```
dotnet run
```

Now, the project will be hosted in http://localhost. To ensure the Amazon-s3-service, map the following URL in your browser.

```
http://localhost:<port-number>/api/test
```

## File Manager AjaxSettings

To access the basic actions such as Read, Delete, Copy, Move, Rename, Search, and Get Details of File Manager using Amazon s3 service, just map the following code snippet in the Ajaxsettings property of File Manager.

Here, the `hostUrl` will be your locally hosted port number.

```
  var hostUrl = http://localhost:62870/;
  ajaxSettings: {
        url: hostUrl + 'api/AmazonS3Provider/AmazonS3FileOperations'
  }
```

## File download AjaxSettings

To perform download operation, initialize the `downloadUrl` property in ajaxSettings of the File Manager component.

```
  var hostUrl = http://localhost:62870/;
  ajaxSettings: {
        url: hostUrl + 'api/AmazonS3Provider/AmazonS3FileOperations',
        downloadUrl: hostUrl + 'api/AmazonS3Provider/AmazonS3Download'
  }
```

## File upload AjaxSettings

To perform upload operation, initialize the `uploadUrl` property in ajaxSettings of the File Manager component.

```
  var hostUrl = http://localhost:62870/;
  ajaxSettings: {
        url: hostUrl + 'api/AmazonS3Provider/AmazonS3FileOperations',
        uploadUrl: hostUrl + 'api/AmazonS3Provider/AmazonS3Upload'
  }
```

## File image preview AjaxSettings

To perform image preview support in the File Manager component, initialize the `getImageUrl` property in ajaxSettings of the File Manager component.

```
  var hostUrl = http://localhost:62870/;
  ajaxSettings: {
        url: hostUrl + 'api/AmazonS3Provider/AmazonS3FileOperations',
         getImageUrl: hostUrl + 'api/AmazonS3Provider/AmazonS3GetImage'
  }
```

The FileManager will be rendered as the following.

![File Manager](https://ej2.syncfusion.com/products/images/file-manager/readme.gif)

## Support

Product support is available through the following mediums:

* Creating incident in Syncfusion [Direct-trac](https://www.syncfusion.com/support/directtrac/incidents?utm_source=npm&utm_campaign=filemanager) support system or [Community forum](https://www.syncfusion.com/forums/essential-js2?utm_source=npm&utm_campaign=filemanager).

* New [GitHub issue](https://github.com/syncfusion/ej2-javascript-ui-controls/issues/new).

* Ask your query in [Stack Overflow](https://stackoverflow.com/?utm_source=npm&utm_campaign=filemanager) with tag `syncfusion` and `ej2`.

## License

Check the license details [here](https://github.com/syncfusion/ej2-javascript-ui-controls/blob/master/license).

## Changelog

Check the changelog [here](https://github.com/syncfusion/ej2-javascript-ui-controls/blob/master/controls/filemanager/CHANGELOG.md)

© Copyright 2020 Syncfusion, Inc. All Rights Reserved. The Syncfusion Essential Studio license and copyright applies to this distribution.