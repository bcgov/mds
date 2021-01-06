using Syncfusion.EJ2.FileManager.AmazonS3FileProvider;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using Syncfusion.EJ2.FileManager.Base;
using Amazon;

namespace EJ2AmazonS3ASPCoreFileProvider.Controllers
{

    [Route("api/[controller]")]
    [EnableCors("AllowAllOrigins")]
    public class AmazonS3ProviderController : Controller
    {
        public AmazonS3FileProvider operation;
        public string basePath;
        protected RegionEndpoint bucketRegion;
        public AmazonS3ProviderController(IHostingEnvironment hostingEnvironment)
        {
            this.basePath = hostingEnvironment.ContentRootPath;
            this.operation = new AmazonS3FileProvider();

            // TODO: Add valid parameters!
            this.operation.RegisterAmazonS3("<---bucketName--->", "<---awsAccessKeyId--->", "<---awsSecretAccessKey--->", "<---serviceName--->");
        }

        [Route("AmazonS3FileOperations")]
        public object AmazonS3FileOperations([FromBody] FileManagerDirectoryContent args)
        {
            switch (args.Action)
            {
                case "read":
                    // reads the file(s) or folder(s) from the given path.
                    return this.operation.ToCamelCase(this.operation.GetFiles(args.Path, false, args.Data));
                case "details":
                    // gets the details of the selected file(s) or folder(s).
                    return this.operation.ToCamelCase(this.operation.Details(args.Path, args.Names, args.Data));
                case "search":
                    // gets the list of file(s) or folder(s) from a given path based on the searched key string.
                    return this.operation.ToCamelCase(this.operation.Search(args.Path, args.SearchString, args.ShowHiddenItems, args.CaseSensitive));
            }
            return null;
        }

        // downloads the selected file(s) and folder(s)
        [Route("AmazonS3Download")]
        public IActionResult AmazonS3Download(string downloadInput)
        {
            FileManagerDirectoryContent args = JsonConvert.DeserializeObject<FileManagerDirectoryContent>(downloadInput);
            return operation.Download(args.Path, args.Names);
        }

        // gets the image(s) from the given path
        [Route("AmazonS3GetImage")]
        public IActionResult AmazonS3GetImage(FileManagerDirectoryContent args)
        {
            return operation.GetImage(args.Path, args.Id, false, null, args.Data);
        }
    }

}
