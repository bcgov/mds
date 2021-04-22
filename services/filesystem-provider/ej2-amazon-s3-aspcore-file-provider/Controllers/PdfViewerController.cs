using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.Extensions.Caching.Memory;
using Syncfusion.EJ2.FileManager.AmazonS3FileProvider;
using Newtonsoft.Json;
using Syncfusion.EJ2.PdfViewer;
using System;
using System.Collections.Generic;
using System.IO;

namespace EJ2AmazonS3ASPCoreFileProvider.Controllers
{
    [Route("file-api/[controller]")]
    [ApiController]
    [EnableCors("AllowAllOrigins")]
    public class PdfViewerController : ControllerBase
    {
        public AmazonS3FileProvider operation;
        public IMemoryCache _cache;

        private IHostingEnvironment _hostingEnvironment;

        public PdfViewerController(IHostingEnvironment hostingEnvironment, IMemoryCache cache)
        {
            _hostingEnvironment = hostingEnvironment;
            _cache = cache;
            this.operation = new AmazonS3FileProvider();

            string name = System.Environment.GetEnvironmentVariable("OBJECT_STORE_BUCKET");
            string awsAccessKeyId = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY_ID");
            string awsSecretAccessKey = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY");
            string serviceName = System.Environment.GetEnvironmentVariable("OBJECT_STORE_HOST");
            this.operation.RegisterAmazonS3(name, awsAccessKeyId, awsSecretAccessKey, serviceName);
        }

        [HttpPost]
        [Route("Load")]
        // Post action for Loading the PDF documents   
        public IActionResult Load([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            MemoryStream stream = new MemoryStream();
            object jsonResult = new object();
            if (jsonObject != null && jsonObject.ContainsKey("document"))
            {
                if (bool.Parse(jsonObject["isFileName"]))
                {
                    string path = Path.GetDirectoryName(jsonObject["document"]) + "/";
                    string filename = Path.GetFileName(jsonObject["document"]);
                    var fsr = this.operation.Download(path, new string[] { filename });
                    if (fsr == null)
                    {
                        return this.Content(jsonObject["document"] + " is not found");
                    }
                    fsr.FileStream.CopyTo(stream);
                }
                else
                {
                    byte[] bytes = Convert.FromBase64String(jsonObject["document"]);
                    stream = new MemoryStream(bytes);
                }
            }
            jsonResult = pdfviewer.Load(stream, jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [HttpPost]
        [Route("Bookmarks")]
        // Post action for processing the bookmarks from the PDF documents
        public IActionResult Bookmarks([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            var jsonResult = pdfviewer.GetBookmarks(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [HttpPost]
        [Route("RenderPdfPages")]
        // Post action for processing the PDF documents  
        public IActionResult RenderPdfPages([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetPage(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [HttpPost]
        [Route("RenderThumbnailImages")]
        // Post action for rendering the ThumbnailImages
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object result = pdfviewer.GetThumbnailImages(jsonObject);
            return Content(JsonConvert.SerializeObject(result));
        }

        [HttpPost]
        [Route("RenderAnnotationComments")]
        // Post action for rendering the annotations
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [HttpPost]
        [Route("ExportAnnotations")]
        // Post action to export annotations
        public IActionResult ExportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = pdfviewer.ExportAnnotation(jsonObject);
            return Content(jsonResult);
        }

        [HttpPost]
        [Route("ImportAnnotations")]
        // Post action to import annotations
        // NOTE: This is not implemented properly yet as it will need to grab the file from our S3 bucket.
        public IActionResult ImportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = string.Empty;
            if (jsonObject != null && jsonObject.ContainsKey("fileName"))
            {
                string documentPath = GetDocumentPath(jsonObject["fileName"]);
                if (!string.IsNullOrEmpty(documentPath))
                {
                    jsonResult = System.IO.File.ReadAllText(documentPath);
                }
                else
                {
                    return this.Content(jsonObject["document"] + " is not found");
                }
            }
            return Content(jsonResult);
        }


        [HttpPost]
        [Route("ExportFormFields")]
        public IActionResult ExportFormFields([FromBody] Dictionary<string, string> jsonObject)

        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = pdfviewer.ExportFormFields(jsonObject);
            return Content(jsonResult);
        }


        [HttpPost]
        [Route("ImportFormFields")]
        public IActionResult ImportFormFields([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.ImportFormFields(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [HttpPost]
        [Route("Unload")]
        // Post action for unloading and disposing the PDF document resources  
        public IActionResult Unload([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            pdfviewer.ClearCache(jsonObject);
            return this.Content("Document cache is cleared");
        }


        [HttpPost]
        [Route("Download")]
        // Post action for downloading the PDF documents
        public IActionResult Download([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
            return Content(documentBase);
        }

        [HttpPost]
        [Route("PrintImages")]
        // Post action for printing the PDF documents
        public IActionResult PrintImages([FromBody] Dictionary<string, string> jsonObject)
        {
            // Initialize the PDF Viewer object with memory cache object
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object pageImage = pdfviewer.GetPrintImage(jsonObject);
            return Content(JsonConvert.SerializeObject(pageImage));
        }

        // Gets the path of the PDF document
        private string GetDocumentPath(string document)
        {
            string documentPath = string.Empty;
            if (!System.IO.File.Exists(document))
            {
                var path = _hostingEnvironment.ContentRootPath;
                if (System.IO.File.Exists(path + "/Data/" + document))
                    documentPath = path + "/Data/" + document;
            }
            else
            {
                documentPath = document;
            }
            Console.WriteLine(documentPath);
            return documentPath;
        }

        private void PrintPayload(Dictionary<string, string> dict)
        {
            foreach (KeyValuePair<string, string> kvp in dict)
            {
                Console.WriteLine("Key = {0}, Value = {1}", kvp.Key, kvp.Value);
            }
        }
    }

}
