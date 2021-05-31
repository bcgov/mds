using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;
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
    [EnableCors("AllowAllOrigins")]
    [ApiController]
    public class PdfViewerController : ControllerBase
    {
        public AmazonS3FileProvider operation;
        public IMemoryCache _mCache;

        private IWebHostEnvironment _hostingEnvironment;

        public PdfViewerController(IWebHostEnvironment hostingEnvironment, IMemoryCache cache)
        {
            _mCache = cache;
            _hostingEnvironment = hostingEnvironment;
            this.operation = new AmazonS3FileProvider();

            string name = System.Environment.GetEnvironmentVariable("OBJECT_STORE_BUCKET");
            string awsAccessKeyId = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY_ID");
            string awsSecretAccessKey = System.Environment.GetEnvironmentVariable("OBJECT_STORE_ACCESS_KEY");
            string serviceName = System.Environment.GetEnvironmentVariable("OBJECT_STORE_HOST");
            this.operation.RegisterAmazonS3(name, awsAccessKeyId, awsSecretAccessKey, serviceName);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Load")]
        [Authorize("View")]
        public IActionResult Load([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer.ReferencePath = _hostingEnvironment.WebRootPath + "\\";
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            MemoryStream stream = new MemoryStream();
            object jsonResult = new object();
            if (jsonObject != null && jsonObject.ContainsKey("document"))
            {
                if (bool.Parse(jsonObject["isFileName"]))
                {
                    string path = Path.GetDirectoryName(jsonObject["document"]) + "/";
                    string filename = Path.GetFileName(jsonObject["document"]);
                    FileStreamResult fsr = this.operation.Download(path, new string[] { filename });
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
            ContentResult result = Content(JsonConvert.SerializeObject(jsonResult));
            return result;
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Bookmarks")]
        [Authorize("View")]
        public IActionResult Bookmarks([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object jsonResult = pdfviewer.GetBookmarks(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderPdfPages")]
        [Authorize("View")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object jsonResult = pdfviewer.GetPage(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderAnnotationComments")]
        [Authorize("View")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Unload")]
        [Authorize("View")]
        public IActionResult Unload([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            pdfviewer.ClearCache(jsonObject);
            return this.Content("Document cache is cleared");
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderThumbnailImages")]
        [Authorize("View")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object result = pdfviewer.GetThumbnailImages(jsonObject);
            return Content(JsonConvert.SerializeObject(result));
        }

        [HttpPost]
        [Route("Download")]
        [Authorize("View")]
        public IActionResult Download([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
            return Content(documentBase);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PrintImages")]
        [Authorize("View")]
        public IActionResult PrintImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object pageImage = pdfviewer.GetPrintImage(jsonObject);
            return Content(JsonConvert.SerializeObject(pageImage));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ExportAnnotations")]
        [Authorize("View")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            string jsonResult = pdfviewer.ExportAnnotation(jsonObject);
            return Content(jsonResult);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ImportAnnotations")]
        [Authorize("View")]
        // NOTE: This is not implemented properly as it will need to get the document from the S3 bucket.
        public IActionResult ImportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            string jsonResult = string.Empty;
            object JsonResult;
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
            else
            {
                string extension = Path.GetExtension(jsonObject["importedData"]);
                if (extension != ".xfdf")
                {
                    JsonResult = pdfviewer.ImportAnnotation(jsonObject);
                    return Content(JsonConvert.SerializeObject(JsonResult));
                }
                else
                {
                    string documentPath = GetDocumentPath(jsonObject["importedData"]);
                    if (!string.IsNullOrEmpty(documentPath))
                    {
                        byte[] bytes = System.IO.File.ReadAllBytes(documentPath);
                        jsonObject["importedData"] = Convert.ToBase64String(bytes);
                        JsonResult = pdfviewer.ImportAnnotation(jsonObject);
                        return Content(JsonConvert.SerializeObject(JsonResult));
                    }
                    else
                    {
                        return this.Content(jsonObject["document"] + " is not found");
                    }
                }

            }
            return Content(jsonResult);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ExportFormFields")]
        [Authorize("View")]
        public IActionResult ExportFormFields(Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            string jsonResult = pdfviewer.ExportFormFields(jsonObject);
            return Content(jsonResult);
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ImportFormFields")]
        [Authorize("View")]
        public IActionResult ImportFormFields(Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_mCache);
            object jsonResult = pdfviewer.ImportFormFields(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        private string GetDocumentPath(string document)
        {
            string documentPath = string.Empty;
            if (!System.IO.File.Exists(document))
            {
                var path = _hostingEnvironment.ContentRootPath;
                if (System.IO.File.Exists(path + "\\Data\\" + document))
                    documentPath = path + "\\Data\\" + document;
            }
            else
            {
                documentPath = document;
            }
            return documentPath;
        }
    }

}
