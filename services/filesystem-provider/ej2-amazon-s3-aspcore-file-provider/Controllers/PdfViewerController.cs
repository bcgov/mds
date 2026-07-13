using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Caching.Distributed;
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
        public IDistributedCache _cache;

        private IWebHostEnvironment _hostingEnvironment;

        public PdfViewerController(IWebHostEnvironment hostingEnvironment, IDistributedCache cache)
        {
            _cache = cache;
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
            try
            {
                // Resolve a safe, writable ReferencePath for Syncfusion assets (avoid root '/')
                var webRoot = _hostingEnvironment.WebRootPath;
                var basePath = !string.IsNullOrWhiteSpace(webRoot)
                    ? webRoot
                    : Path.Combine(AppContext.BaseDirectory ?? ".", "wwwroot");
                Directory.CreateDirectory(basePath);
                // Some Syncfusion components probe ReferencePath/x64; pre-create to avoid permission issues
                Directory.CreateDirectory(Path.Combine(basePath, "x64"));
                PdfRenderer.ReferencePath = basePath.EndsWith(Path.DirectorySeparatorChar)
                    ? basePath
                    : basePath + Path.DirectorySeparatorChar;

                PdfRenderer pdfviewer = new PdfRenderer(_cache);
                MemoryStream stream = new MemoryStream();
                object jsonResult = new object();
                if (jsonObject != null && jsonObject.ContainsKey("document"))
                {
                    if (bool.TryParse(jsonObject.GetValueOrDefault("isFileName"), out bool isFileName) && isFileName)
                    {
                        string path = Path.GetDirectoryName(jsonObject["document"]) + "/";
                        string filename = Path.GetFileName(jsonObject["document"]);
                        FileStreamResult fsr = this.operation.Download(path, new string[] { filename });
                        if (fsr == null)
                        {
                            return NotFound(jsonObject["document"] + " is not found");
                        }
                        fsr.FileStream.CopyTo(stream);
                    }
                    else if (jsonObject.TryGetValue("document", out var base64))
                    {
                        byte[] bytes = Convert.FromBase64String(base64);
                        stream = new MemoryStream(bytes);
                    }
                }
                jsonResult = pdfviewer.Load(stream, jsonObject);
                return Content(JsonConvert.SerializeObject(jsonResult));
            }
            catch (Exception ex)
            {
                // Provide clearer error to client instead of 204/no content
                var error = new { message = "Failed to load PDF", detail = ex.Message, type = ex.GetType().FullName };
                return StatusCode(500, JsonConvert.SerializeObject(error));
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Bookmarks")]
        [Authorize("View")]
        public IActionResult Bookmarks([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetBookmarks(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderPdfPages")]
        [Authorize("View")]
        public IActionResult RenderPdfPages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetPage(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderPdfTexts")]
        [Authorize("View")]
        public IActionResult RenderPdfTexts([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetDocumentText(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderAnnotationComments")]
        [Authorize("View")]
        public IActionResult RenderAnnotationComments([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.GetAnnotationComments(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("Unload")]
        [Authorize("View")]
        public IActionResult Unload([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            pdfviewer.ClearCache(jsonObject);
            return this.Content("Document cache is cleared");
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("RenderThumbnailImages")]
        [Authorize("View")]
        public IActionResult RenderThumbnailImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object result = pdfviewer.GetThumbnailImages(jsonObject);
            return Content(JsonConvert.SerializeObject(result));
        }

        [HttpPost]
        [Route("Download")]
        [Authorize("View")]
        public IActionResult Download([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string documentBase = pdfviewer.GetDocumentAsBase64(jsonObject);
            return Content(documentBase);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("PrintImages")]
        [Authorize("View")]
        public IActionResult PrintImages([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object pageImage = pdfviewer.GetPrintImage(jsonObject);
            return Content(JsonConvert.SerializeObject(pageImage));
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ExportAnnotations")]
        [Authorize("View")]
        public IActionResult ExportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = pdfviewer.ExportAnnotation(jsonObject);
            return Content(jsonResult);
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ImportAnnotations")]
        [Authorize("View")]
        public IActionResult ImportAnnotations([FromBody] Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);

            if (jsonObject != null && jsonObject.ContainsKey("fileName"))
            {
                string path = Path.GetDirectoryName(jsonObject["fileName"]) + "/";
                string filename = Path.GetFileName(jsonObject["fileName"]);
                FileStreamResult fsr = this.operation.Download(path, new string[] { filename });

                if (fsr == null)
                {
                    return NotFound(jsonObject["fileName"] + " is not found");
                }

                using (StreamReader reader = new StreamReader(fsr.FileStream))
                {
                    return Content(reader.ReadToEnd());
                }
            }
            else
            {
                string extension = Path.GetExtension(jsonObject["importedData"]);
                if (extension != ".xfdf")
                {
                    object JsonResult = pdfviewer.ImportAnnotation(jsonObject);
                    return Content(JsonConvert.SerializeObject(JsonResult));
                }
                else
                {
                    string path = Path.GetDirectoryName(jsonObject["importedData"]) + "/";
                    string filename = Path.GetFileName(jsonObject["importedData"]);
                    FileStreamResult fsr = this.operation.Download(path, new string[] { filename });

                    if (fsr == null)
                    {
                        return NotFound(jsonObject["importedData"] + " is not found");
                    }

                    using (MemoryStream ms = new MemoryStream())
                    {
                        fsr.FileStream.CopyTo(ms);
                        byte[] bytes = ms.ToArray();
                        jsonObject["importedData"] = Convert.ToBase64String(bytes);
                        object JsonResult = pdfviewer.ImportAnnotation(jsonObject);
                        return Content(JsonConvert.SerializeObject(JsonResult));
                    }
                }
            }
        }

        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ExportFormFields")]
        [Authorize("View")]
        public IActionResult ExportFormFields(Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            string jsonResult = pdfviewer.ExportFormFields(jsonObject);
            return Content(jsonResult);
        }
        [AcceptVerbs("Post")]
        [HttpPost]
        [Route("ImportFormFields")]
        [Authorize("View")]
        public IActionResult ImportFormFields(Dictionary<string, string> jsonObject)
        {
            PdfRenderer pdfviewer = new PdfRenderer(_cache);
            object jsonResult = pdfviewer.ImportFormFields(jsonObject);
            return Content(JsonConvert.SerializeObject(jsonResult));
        }
    }

}
