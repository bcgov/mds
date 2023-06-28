using Syncfusion.EJ2.FileManager.AmazonS3FileProvider;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Syncfusion.EJ2.FileManager.Base;
using Amazon;

namespace EJ2AmazonS3ASPCoreFileProvider.Controllers
{

    [Route("file-api/[controller]")]
    [EnableCors("AllowAllOrigins")]
    public class AmazonS3ProviderController : Controller
    {
        public AmazonS3FileProvider operation;
        public string basePath;
        protected RegionEndpoint bucketRegion;
        public AmazonS3ProviderController(IWebHostEnvironment hostingEnvironment)
        {
            this.basePath = hostingEnvironment.ContentRootPath;
            this.operation = new AmazonS3FileProvider();

            string name = System.Environment.GetEnvironmentVariable("OBJECT_STORE_BUCKET");
            string awsAccessKeyId = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY_ID");
            string awsSecretAccessKey = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY");
            string serviceName = System.Environment.GetEnvironmentVariable("OBJECT_STORE_HOST");
            this.operation.RegisterAmazonS3(name, awsAccessKeyId, awsSecretAccessKey, serviceName);
        }

        [HttpPost]
        [Route("AmazonS3FileOperations")]
        [Authorize("View")]
        public object AmazonS3FileOperations([FromBody] FileManagerDirectoryContent args)
        {
            switch (args.Action)
            {
                case "read":
                    // Reads the file(s) or folder(s) from the given path
                    return this.operation.ToCamelCase(this.operation.GetFiles(args.Path, false, args.Data));
                case "details":
                    // Gets the details of the selected file(s) or folder(s)
                    return this.operation.ToCamelCase(this.operation.Details(args.Path, args.Names, args.Data));
                case "search":
                    // Gets the list of file(s) or folder(s) from a given path based on the searched key string
                    return this.operation.ToCamelCase(this.operation.Search(args.Path, args.SearchString, args.ShowHiddenItems, args.CaseSensitive));
            }
            return null;
        }

        // Downloads the selected file(s) and folder(s)
        [HttpPost]
        [Route("AmazonS3Download")]
        [Authorize("View")]
        public IActionResult AmazonS3Download(string downloadInput)
        {
            Response.Headers.Add("Access-Control-Expose-Headers", "Content-Disposition");
            FileManagerDirectoryContent args = JsonConvert.DeserializeObject<FileManagerDirectoryContent>(downloadInput);
            return operation.Download(args.Path, args.Names);
        }

        // Gets the image(s) from the given path
        [HttpGet]
        [Route("AmazonS3GetImage")]
        [Authorize("View")]
        public IActionResult AmazonS3GetImage(FileManagerDirectoryContent args)
        {
            return operation.GetImage(args.Path, args.Id, false, null, args.Data);
        }
    }

}
