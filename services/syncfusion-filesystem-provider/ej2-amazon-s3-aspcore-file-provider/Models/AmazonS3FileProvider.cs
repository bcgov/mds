using Amazon.S3;
using Amazon.S3.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Syncfusion.EJ2.FileManager.Base;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.IO;
using Microsoft.AspNetCore.Http;
using Amazon.S3.Transfer;
using Microsoft.AspNetCore.Mvc;
using System.IO.Compression;
using Amazon.Runtime;

namespace Syncfusion.EJ2.FileManager.AmazonS3FileProvider
{
    public class AmazonS3FileProvider : AmazonS3FileProviderBase
    {
        protected static string bucketName;
        static IAmazonS3 client;
        static ListObjectsResponse response;
        static ListObjectsResponse childResponse;
        public string RootName;
        long sizeValue = 0;
        List<FileManagerDirectoryContent> s3ObjectFiles = new List<FileManagerDirectoryContent>();
        TransferUtility fileTransferUtility = new TransferUtility(client);

        // Register the amazon client details
        public void RegisterAmazonS3(string name, string awsAccessKeyId, string awsSecretAccessKey, string serviceName)
        {
            bucketName = name;
            AWSCredentials creds = new BasicAWSCredentials(awsAccessKeyId, awsSecretAccessKey);

            AmazonS3Config config = new AmazonS3Config
            {
                ServiceURL = "https://" + serviceName,
                ForcePathStyle = true,
                // TODO: Figure out optimal params.
                //DisableLogging = false,
                //LogResponse = true,
                //Timeout = TimeSpan.FromSeconds(5)
            };

            client = new AmazonS3Client(creds, config);
        }

        // Define the root directory to the file manager
        public void GetBucketList()
        {
            RootName = System.Environment.GetEnvironmentVariable("S3_PREFIX");
        }

        // Reads the file(s) and folder(s)
        public FileManagerResponse GetFiles(string path, bool showHiddenItems, params FileManagerDirectoryContent[] data)
        {
            FileManagerDirectoryContent cwd = new FileManagerDirectoryContent();
            List<FileManagerDirectoryContent> files = new List<FileManagerDirectoryContent>();
            List<FileManagerDirectoryContent> filesS3 = new List<FileManagerDirectoryContent>();
            FileManagerResponse readResponse = new FileManagerResponse();
            GetBucketList();
            try
            {
                if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                if (path == "/")
                {
                    FileManagerDirectoryContent[] s = response.S3Objects.Where(x => x.Key == RootName).Select(y => CreateDirectoryContentInstance(y.Key.ToString().Replace("/", ""), true, "png", y.Size, new DateTime(), new DateTime(), this.checkChild(y.Key), null)).ToArray();
                    if (s.Length > 0) cwd = s[0];
                }
                else
                    cwd = CreateDirectoryContentInstance(path.Split("/")[path.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), (response.CommonPrefixes.Count > 0) ? true : false, null);
            }
            catch (Exception ex) { throw ex; }
            try
            {
                if (response.CommonPrefixes.Count > 0)
                    files = response.CommonPrefixes.Select((y, i) => CreateDirectoryContentInstance(response.CommonPrefixes[i].Replace(RootName.Replace("/", "") + path, "").Replace("/", ""), false, "Folder", 0, new DateTime(), new DateTime(), this.checkChild(response.CommonPrefixes[i]), null)).ToList();
            }
            catch (Exception ex) { throw ex; }
            try
            {
                if (response.S3Objects.Count > 0)
                    filesS3 = response.S3Objects.Where(x => x.Key != RootName.Replace("/", "") + path).Select(y => CreateDirectoryContentInstance(y.Key.ToString().Replace(RootName.Replace("/", "") + path, "").Replace("/", ""), true, Path.GetExtension(y.Key.ToString()), y.Size, y.LastModified, y.LastModified, this.checkChild(y.Key), null)).ToList();
            }
            catch (Exception ex) { throw ex; }
            if (filesS3.Count != 0) files = files.Union(filesS3).ToList();
            readResponse.Files = files;
            readResponse.CWD = cwd;
            return readResponse;
        }

        private FileManagerDirectoryContent CreateDirectoryContentInstance(string name, bool value, string type, long size, DateTime createddate, DateTime modifieddate, bool child, string filterpath)
        {
            FileManagerDirectoryContent tempFile = new FileManagerDirectoryContent();
            tempFile.Name = name;
            tempFile.IsFile = value;
            tempFile.Type = type;
            tempFile.Size = size;
            tempFile.DateCreated = createddate;
            tempFile.DateModified = modifieddate;
            tempFile.HasChild = child;
            tempFile.FilterPath = filterpath;
            return tempFile;
        }


        // Deletes file(s) or folder(s)
        public FileManagerResponse Delete(string path, string[] names, params FileManagerDirectoryContent[] data)
        {
            return AsyncDelete(path, names, data).Result;
        }

        // Delete async method
        public virtual async Task<FileManagerResponse> AsyncDelete(string path, string[] names, params FileManagerDirectoryContent[] data)
        {
            FileManagerResponse removeResponse = new FileManagerResponse();
            try
            {
                List<FileManagerDirectoryContent> files = new List<FileManagerDirectoryContent>();
                GetBucketList();
                if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                foreach (string name in names)
                {
                    if (response.CommonPrefixes.Count > 1)
                    {
                        foreach (string commonPrefix in response.CommonPrefixes)
                        {
                            if (commonPrefix == this.RootName.Replace("/", "") + path + name)
                                files.Add(CreateDirectoryContentInstance(commonPrefix.Split("/")[commonPrefix.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), false, ""));
                        }
                    }
                    if (response.S3Objects.Count > 1)
                    {
                        foreach (S3Object S3Object in response.S3Objects)
                        {
                            if (S3Object.Key == this.RootName.Replace("/", "") + path + name)
                                files.Add(CreateDirectoryContentInstance(S3Object.Key.Split("/").Last(), true, Path.GetExtension(S3Object.Key), S3Object.Size, S3Object.LastModified, S3Object.LastModified, false, ""));
                        }
                    }
                }
                await DeleteDirectory(path, names);
                removeResponse.Files = files;
            }
            catch (Exception ex) { throw ex; }
            return removeResponse;
        }

        // Copy the file(s) or folder(s) from a source directory and pastes in given target directory
        public FileManagerResponse Copy(string path, string targetPath, string[] names, string[] replacedItemNames, FileManagerDirectoryContent TargetData, params FileManagerDirectoryContent[] data)
        {
            return this.TransferItems(path, targetPath, names, replacedItemNames, false, TargetData, data);
        }

        // Cut the file(s) or folder(s) from a source directory and pastes in given target directory
        public FileManagerResponse Move(string path, string targetPath, string[] names, string[] replacedItemNames, FileManagerDirectoryContent TargetData, params FileManagerDirectoryContent[] data)
        {
            return this.TransferItems(path, targetPath, names, replacedItemNames, true, TargetData, data);
        }

        // Cut or Copy the file(s) or folder(s) from a source directory and pastes in given target directory
        public FileManagerResponse TransferItems(string path, string targetPath, string[] names, string[] replacedItemNames, bool isCutRequest, FileManagerDirectoryContent TargetData, params FileManagerDirectoryContent[] data)
        {
            FileManagerResponse moveResponse = new FileManagerResponse();
            FileManagerDirectoryContent cwd = new FileManagerDirectoryContent();
            List<FileManagerDirectoryContent> files = new List<FileManagerDirectoryContent>();
            List<FileManagerDirectoryContent> otherFiles = new List<FileManagerDirectoryContent>();
            List<string> existFiles = new List<string>();
            try
            {
                GetBucketList();
                FileManagerResponse readResponse = new FileManagerResponse();
                if (targetPath == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + targetPath, false).Wait();
                if (targetPath == "/")
                    cwd = response.S3Objects.Where(x => x.Key == RootName).Select(y => CreateDirectoryContentInstance(y.Key.ToString().Replace("/", ""), true, "folder", y.Size, new DateTime(), new DateTime(), false, "")).ToArray()[0];
                else if (response.CommonPrefixes.Count > 0)
                    cwd = CreateDirectoryContentInstance(names[0].Contains("/") ? names[0].Split("/")[names[0].Split("/").Length - 2] : (path == "/" ? "Files" : path.Split("/")[path.Split("/").Length - 2]), false, "Folder", 0, new DateTime(), new DateTime(), (response.CommonPrefixes.Count > 0) ? true : false, "");
                GetBucketList();
                if (names[0].Contains("/"))
                {
                    foreach (string name in names)
                    {
                        path = "/" + name.Substring(0, name.Length - name.Split("/")[name.Split("/").Length - (name.EndsWith("/") ? 0 : 1)].Length);
                        string n = "";
                        n = name.EndsWith("/") ? name.Split("/")[name.Split("/").Length - 2] : name.Split("/").Last();
                        if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                        if (response.CommonPrefixes.Count > 0)
                        {
                            foreach (string commonPrefix in response.CommonPrefixes)
                            {
                                if (commonPrefix == this.RootName + name + "/")
                                    files.Add(CreateDirectoryContentInstance(commonPrefix, false, "Folder", 0, new DateTime(), new DateTime(), false, ""));
                            }
                        }
                        if (response.S3Objects.Count > 0)
                        {
                            foreach (S3Object S3Object in response.S3Objects)
                            {
                                if (S3Object.Key == this.RootName.Replace("/", "") + path + n)
                                    files.Add(CreateDirectoryContentInstance(S3Object.Key, true, Path.GetExtension(S3Object.Key), S3Object.Size, S3Object.LastModified, S3Object.LastModified, false, ""));
                            }
                        }
                    }
                }
                else
                {
                    if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                    if (response.CommonPrefixes.Count > 1)
                    {
                        foreach (string commonPrefix in response.CommonPrefixes)
                        {
                            foreach (string n in names)
                            {
                                if (commonPrefix == this.RootName.Replace("/", "") + path + n + "/")
                                {
                                    files.Add(CreateDirectoryContentInstance(commonPrefix.Split("/")[commonPrefix.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), false, ""));
                                }
                            }
                        }
                    }
                    if (response.S3Objects.Count > 1)
                    {
                        foreach (S3Object S3Object in response.S3Objects)
                        {
                            foreach (string n in names)
                            {
                                if (S3Object.Key == this.RootName.Replace("/", "") + path + n)
                                {
                                    files.Add(CreateDirectoryContentInstance(S3Object.Key.Split("/").Last(), true, Path.GetExtension(S3Object.Key), S3Object.Size, S3Object.LastModified, S3Object.LastModified, false, ""));
                                }
                            }
                        }
                    }
                }
                foreach (FileManagerDirectoryContent file in files)
                {
                    if (file.Type == "Folder")
                    {
                        int directoryCount = 0;
                        string fName = (names[0].Contains("/")) ? file.Name.Split("/")[file.Name.Split("/").Length - 2] : file.Name;
                        while (this.checkFileExist(targetPath, fName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : ""))) { directoryCount++; }
                        if (directoryCount > 0) existFiles.Add(file.Name); else otherFiles.Add(file);
                        file.Name = file.Name + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "");
                    }
                    else
                    {
                        string fileName = file.Name.Substring(0, file.Name.Length - file.Type.Length);
                        int directoryCount = 0;
                        string fName = (names[0].Contains("/")) ? file.Name.Split("/").Last() : file.Name;
                        while (this.checkFileExist(targetPath, fName.Substring(0, fName.Length - file.Type.Length) + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + file.Type)) { directoryCount++; }
                        if (directoryCount > 0) existFiles.Add(file.Name); else otherFiles.Add(file);
                        file.Name = fileName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + file.Type;
                    }
                }
            }
            catch (Exception ex) { throw ex; }
            if (names[0].Contains("/"))
            {
                foreach (var x in names.Select((name, index) => new { name, index }))
                {
                    string nameValue = "";
                    string checkRoot = x.name;
                    path = "/" + x.name.Substring(0, x.name.Length - x.name.Split("/")[x.name.Split("/").Length - (x.name.EndsWith("/") ? 0 : 1)].Length);
                    string n = x.name.Split("/")[x.name.Split("/").Length - (x.name.EndsWith("/") ? 0 : 1)];
                    if (Path.GetExtension(x.name) == "Folder")
                    {
                        int directoryCount = 0;
                        while (this.checkFileExist(targetPath, n + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : ""))) { directoryCount++; }
                        nameValue = n + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "");
                    }
                    else
                    {
                        string fileName = n.Substring(0, n.Length - Path.GetExtension(x.name).Length);
                        int directoryCount = 0;
                        while (this.checkFileExist(targetPath, fileName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + Path.GetExtension(x.name))) { directoryCount++; }
                        nameValue = fileName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + Path.GetExtension(x.name);
                    }
                    if (existFiles.Count == 0) { MoveDirectoryAsync((RootName + checkRoot + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), Path.GetExtension(x.name) != "Folder", isCutRequest); }
                    else if (replacedItemNames.Length != 0)
                    {
                        foreach (string exFile in existFiles)
                        {
                            if (x.name != exFile || replacedItemNames.Length > 0)
                                MoveDirectoryAsync((RootName + checkRoot + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), Path.GetExtension(x.name) != "Folder", isCutRequest);
                        }
                    }
                    else
                    {
                        foreach (FileManagerDirectoryContent otherFile in otherFiles)
                        {
                            if (existFiles.Where(p => p == x.name).Select(p => p).ToArray().Length < 1)
                                MoveDirectoryAsync((RootName + checkRoot + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), Path.GetExtension(x.name) != "Folder", isCutRequest);
                        }
                    }
                }
            }
            else
            {
                foreach (var x in names.Select((name, index) => new { name, index }))
                {
                    string nameValue = "";
                    if (data[x.index].Type == "Folder")
                    {
                        int directoryCount = 0;
                        while (this.checkFileExist(targetPath, x.name + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : ""))) { directoryCount++; }
                        nameValue = x.name + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "");
                    }
                    else
                    {
                        string fileName = x.name.Substring(0, x.name.Length - data[x.index].Type.Length);
                        int directoryCount = 0;
                        while (this.checkFileExist(targetPath, fileName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + data[x.index].Type)) { directoryCount++; }
                        nameValue = fileName + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "") + data[x.index].Type;
                    }
                    if (existFiles.Count == 0)
                        MoveDirectoryAsync((RootName.Replace("/", "") + path + x.name + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), data[x.index].IsFile, isCutRequest);
                    else if (replacedItemNames.Length != 0)
                    {
                        foreach (string existFile in existFiles)
                        {
                            if (x.name != existFile || replacedItemNames.Length > 0)
                                MoveDirectoryAsync((RootName.Replace("/", "") + path + x.name + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), data[x.index].IsFile, isCutRequest);
                        }
                    }
                    else
                    {
                        foreach (FileManagerDirectoryContent otherFile in otherFiles)
                        {
                            if (existFiles.Where(p => p == x.name).Select(p => p).ToArray().Length < 1)
                                MoveDirectoryAsync((RootName.Replace("/", "") + path + x.name + "/"), (RootName.Replace("/", "") + targetPath + nameValue + "/"), data[x.index].IsFile, isCutRequest);
                        }
                    }
                }
            }
            if (replacedItemNames.Length == 0 && existFiles.Count > 0)
            {
                ErrorDetails er = new ErrorDetails();
                er.FileExists = existFiles;
                er.Code = "400";
                er.Message = "File Already Exists";
                moveResponse.Files = otherFiles;
                moveResponse.Error = er;
                return moveResponse;
            }
            else
            {
                Task.Delay(6000).Wait();
                moveResponse.CWD = cwd;
                moveResponse.Files = files;
                return moveResponse;
            }
        }

        // Renames a directory
        private string DirectoryRename(string newPath)
        {
            int directoryCount = 0;
            while (System.IO.Directory.Exists(newPath + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : ""))) { directoryCount++; }
            return newPath + (directoryCount > 0 ? "(" + directoryCount.ToString() + ")" : "");
        }

        // Gets the details of the file(s) or folder(s)
        public FileManagerResponse Details(string path, string[] names, params FileManagerDirectoryContent[] data)
        {
            FileManagerResponse getDetailResponse = new FileManagerResponse();
            try
            {
                GetBucketList();
                int i = names.Length;
                string location = "";
                if (names.Length > 0 && names[0].Contains("/"))
                    ListingObjectsAsync("/", RootName + names[0], false).Wait();
                else
                    ListingObjectsAsync("/", RootName.Replace("/", "") + (names.Length < 1 ? path.Substring(0, path.Length - 1) : path + data[0].Name), false).Wait();
                if (data.Length == 1)
                {
                    if (names.Length == 0 || data[i - 1].Type == "Folder")
                    {
                        if (response.CommonPrefixes.Count > 0)
                            location = response.CommonPrefixes[0].Substring(0, response.CommonPrefixes[0].Length - 1);
                    }
                    else if (response.S3Objects.Count > 0)
                        location = response.S3Objects[0].Key;
                }
                else location = "Various Files or Folders";
                foreach (string name in names)
                {
                    ListingObjectsAsync("/", RootName.Replace("/", "") + path + name + ((data[i - 1].Type == "Folder") ? "/" : ""), false).Wait();
                    i--;
                    foreach (S3Object key in response.S3Objects) { sizeValue = sizeValue + key.Size; }
                    if (response.CommonPrefixes.Count > 0) this.getChildObjects(response.CommonPrefixes, true, "");
                }
                if (names.Length < 1) this.getChildObjects(response.CommonPrefixes, true, "");
                FileDetails detailFiles = new FileDetails();
                detailFiles = new FileDetails
                {
                    Name = data.Length == 1 ? (String.IsNullOrEmpty(data[0].Name) ? path.Split("/")[path.Split("/").Length - 2] : data[0].Name) : string.Join(", ", data.Select(x => x.Name).ToArray()),
                    IsFile = data[0].IsFile,
                    Size = byteConversion(sizeValue).ToString(),
                    Modified = data.Length == 1 && data[0].IsFile ? data[0].DateModified : new DateTime(),
                    Created = data.Length == 1 && data[0].IsFile ? data[0].DateCreated : new DateTime(),
                    MultipleFiles = data.Length == 1 ? false : true,
                    Location = location,
                };
                ListObjectsResponse res = response;
                getDetailResponse.Details = detailFiles;
            }
            catch (Exception ex) { throw ex; }
            return getDetailResponse;
        }

        public bool checkFileExist(string path, string name)
        {
            GetBucketList();
            ListingObjectsAsync("/", RootName.Replace("/", "") + path, false).Wait();
            bool checkExist = false;
            if (response.CommonPrefixes.Count > 0)
            {
                foreach (string commonPrefix in response.CommonPrefixes)
                {
                    if (commonPrefix.Split("/")[commonPrefix.Split("/").Length - 2].ToLower() == name.ToLower()) { checkExist = true; break; }
                }
            }
            if (response.S3Objects.Count > 0)
            {
                foreach (S3Object s3Object in response.S3Objects)
                {
                    if (s3Object.Key.ToLower() == (RootName.Replace("/", "") + path + name).ToLower()) { checkExist = true; break; }
                }
            }
            return checkExist;
        }

        // Creates a new folder
        public FileManagerResponse Create(string path, string name, params FileManagerDirectoryContent[] data)
        {
            FileManagerResponse createResponse = new FileManagerResponse();
            if (checkFileExist(path, name))
            {
                ErrorDetails er = new ErrorDetails();
                er.Code = "400";
                er.Message = "A file or folder with the name " + name + " already exists.";
                createResponse.Error = er;
                return createResponse;
            }
            else
            {
                try
                {
                    GetBucketList();
                    FileManagerDirectoryContent CreateData = new FileManagerDirectoryContent();
                    string key = string.Format(@"{0}/", RootName.Replace("/", "") + path + name);
                    PutObjectRequest request = new PutObjectRequest() { Key = key, BucketName = bucketName };
                    request.InputStream = new MemoryStream();
                    client.PutObjectAsync(request);
                    CreateData = CreateDirectoryContentInstance(name, false, "Folder", 0, new DateTime(), new DateTime(), false, "");
                    FileManagerDirectoryContent[] newData = new FileManagerDirectoryContent[] { CreateData };
                    createResponse.Files = newData;
                }
                catch (Exception ex) { throw ex; }
            }
            return createResponse;
        }

        // Search for file(s) or folder(s)
        public FileManagerResponse Search(string path, string searchString, bool showHiddenItems, bool caseSensitive, params FileManagerDirectoryContent[] data)
        {
            Task.Delay(2000).Wait();
            FileManagerResponse searchResponse = new FileManagerResponse();
            try
            {
                GetBucketList();
                if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                List<FileManagerDirectoryContent> files = new List<FileManagerDirectoryContent>();
                List<FileManagerDirectoryContent> filesS3 = new List<FileManagerDirectoryContent>();
                char[] j = new Char[] { '*' };
                if (response.CommonPrefixes.Count > 0)
                    files = response.CommonPrefixes.Where(x => x.Split("/")[x.Split("/").Length - 2].ToLower().Contains(searchString.TrimStart(j).TrimEnd(j).ToLower())).Select(x => CreateDirectoryContentInstance(x.Split("/")[x.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), this.checkChild(x), x.Substring(0, x.Length - x.Split("/")[x.Split("/").Length - 2].Length - 1).Substring(RootName.Length - 1))).ToList();
                if (response.S3Objects.Count > 1)
                { // Ensure HasChild property
                    filesS3 = response.S3Objects.Where(x => (x.Key != RootName && x.Key.Split("/")[x.Key.Split("/").Length - 1].ToLower().Contains(searchString.TrimStart(j).TrimEnd(j).ToLower()))).Select(y =>
                    CreateDirectoryContentInstance(y.Key.Split("/").Last(), true, Path.GetExtension(y.Key.ToString()), y.Size, y.LastModified, y.LastModified, false, y.Key.Substring(0, y.Key.Length - y.Key.Split("/")[y.Key.Split("/").Length - 1].Length).Substring(RootName.Length - 1))).ToList();
                }
                if (response.CommonPrefixes.Count > 0) getChildObjects(response.CommonPrefixes, false, searchString);
                if (filesS3.Count != 0) files = files.Union(filesS3).ToList();
                if (s3ObjectFiles.Count != 0) files = files.Union(s3ObjectFiles).ToList();
                searchResponse.Files = files;
            }
            catch (Exception ex) { throw ex; }
            return searchResponse;
        }

        // Renames a file or folder
        public FileManagerResponse Rename(string path, string name, string newName, bool replace = false, params FileManagerDirectoryContent[] data)
        {
            return AsyncRename(path, name, newName, replace, data).Result;
        }
        public virtual async Task<FileManagerResponse> AsyncRename(string path, string name, string newName, bool replace, params FileManagerDirectoryContent[] data)
        {
            GetBucketList();
            FileManagerResponse renameResponse = new FileManagerResponse();
            FileManagerDirectoryContent cwd = new FileManagerDirectoryContent();
            List<FileManagerDirectoryContent> files = new List<FileManagerDirectoryContent>();
            if (checkFileExist(path, newName))
            {
                ErrorDetails er = new ErrorDetails();
                er.Code = "400";
                er.Message = "Cannot rename " + name + " to " + newName + ": destination already exists.";
                renameResponse.Error = er;
                return renameResponse;
            }
            else
            {
                await MoveDirectoryAsync((RootName.Replace("/", "") + path + name + "/"), (RootName.Replace("/", "") + path + newName + "/"), data[0].IsFile, true);
                try
                {
                    GetBucketList();
                    FileManagerResponse readResponse = new FileManagerResponse();
                    if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                    if (path == "/")
                        cwd = response.S3Objects.Where(x => x.Key == RootName).Select(y => CreateDirectoryContentInstance(y.Key.ToString().Replace("/", ""), true, "folder", y.Size, new DateTime(), new DateTime(), false, "")).ToArray()[0];
                    else if (response.CommonPrefixes.Count > 0)
                        cwd = CreateDirectoryContentInstance(path.Split("/")[path.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), (response.CommonPrefixes.Count > 0) ? true : false, "");
                    GetBucketList();
                    if (path == "/") ListingObjectsAsync("/", RootName, false).Wait(); else ListingObjectsAsync("/", this.RootName.Replace("/", "") + path, false).Wait();
                    if (response.CommonPrefixes.Count > 1)
                    {
                        foreach (string commonPrefix in response.CommonPrefixes)
                        {
                            if (commonPrefix == this.RootName.Replace("/", "") + path + newName + "/")
                                files.Add(CreateDirectoryContentInstance(commonPrefix.Split("/")[commonPrefix.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), false, ""));
                        }
                    }
                    if (response.S3Objects.Count > 1)
                    {
                        foreach (S3Object S3Object in response.S3Objects)
                        {
                            if (S3Object.Key == this.RootName.Replace("/", "") + path + newName)
                                files.Add(CreateDirectoryContentInstance(S3Object.Key.Split("/").Last(), true, Path.GetExtension(S3Object.Key), S3Object.Size, S3Object.LastModified, S3Object.LastModified, false, ""));
                        }
                    }
                }
                catch (Exception ex) { throw ex; }
                renameResponse.Files = files;
                return renameResponse;
            }
        }

        public FileManagerResponse Upload(string path, IList<IFormFile> uploadFiles, string action, FileManagerDirectoryContent[] data)
        {
            return AsyncUpload(path, uploadFiles, action, data).Result;
        }

        // Uploads the file(s)
        public virtual async Task<FileManagerResponse> AsyncUpload(string path, IList<IFormFile> uploadFiles, string action, FileManagerDirectoryContent[] data)
        {
            FileManagerResponse uploadResponse = new FileManagerResponse();
            try
            {
                string fileName = Path.GetFileName(uploadFiles[0].FileName);
                GetBucketList();
                List<string> existFiles = new List<string>();
                foreach (IFormFile file in uploadFiles)
                {
                    string name = file.FileName;
                    string fullName = Path.Combine(Path.GetTempPath(), name);
                    if (uploadFiles != null)
                    {
                        if (action == "save")
                        {
                            if (!System.IO.File.Exists(fullName))
                            {
                                using (FileStream fsSource = new FileStream(Path.Combine(Path.GetTempPath(), fileName), FileMode.Create))
                                {
                                    uploadFiles[0].CopyTo(fsSource);
                                    fsSource.Close();
                                }
                                using (FileStream fileToUpload = new FileStream(Path.Combine(Path.GetTempPath(), fileName), FileMode.Open, FileAccess.Read))
                                {
                                    await fileTransferUtility.UploadAsync(fileToUpload, bucketName, RootName.Replace("/", "") + path + file.FileName);
                                }
                            }
                            else
                            {
                                existFiles.Add(name);
                            }

                        }
                        else if (action == "replace")
                        {
                            if (System.IO.File.Exists(fullName))
                            {
                                System.IO.File.Delete(fullName);
                            }
                            using (FileStream fsSource = new FileStream(Path.Combine(Path.GetTempPath(), fileName), FileMode.Create))
                            {
                                file.CopyTo(fsSource);
                                fsSource.Close();
                            }
                            using (FileStream fileToUpload = new FileStream(Path.Combine(Path.GetTempPath(), fileName), FileMode.Open, FileAccess.Read))
                            {
                                await fileTransferUtility.UploadAsync(fileToUpload, bucketName, RootName.Replace("/", "") + path + file.FileName);
                            }

                        }
                        else if (action == "keepboth")
                        {
                            string newName = fullName;
                            string newFileName = file.FileName;
                            int index = fullName.LastIndexOf(".");
                            int indexValue = newFileName.LastIndexOf(".");
                            if (index >= 0)
                            {
                                newName = fullName.Substring(0, index);
                                newFileName = newFileName.Substring(0, indexValue);
                            }
                            int fileCount = 0;
                            while (System.IO.File.Exists(newName + (fileCount > 0 ? "(" + fileCount.ToString() + ")" + Path.GetExtension(name) : Path.GetExtension(name))))
                            {
                                fileCount++;
                            }
                            newName = newFileName + (fileCount > 0 ? "(" + fileCount.ToString() + ")" : "") + Path.GetExtension(name);
                            GetBucketList();
                            using (FileStream fsSource = new FileStream(Path.Combine(Path.GetTempPath(), newName), FileMode.Create))
                            {
                                file.CopyTo(fsSource);
                                fsSource.Close();
                            }
                            using (FileStream fileToUpload = new FileStream(Path.Combine(Path.GetTempPath(), newName), FileMode.Open, FileAccess.Read))
                            {
                                await fileTransferUtility.UploadAsync(fileToUpload, bucketName, RootName.Replace("/", "") + path + newName);
                            }
                        }
                        else if (action == "remove")
                        {
                            if (System.IO.File.Exists(fullName))
                            {
                                System.IO.File.Delete(fullName);
                            }
                            else
                            {
                                ErrorDetails er = new ErrorDetails();
                                er.Code = "404";
                                er.Message = "File not found.";
                                uploadResponse.Error = er;
                            }
                        }
                    }
                }
                if (existFiles.Count != 0)
                {
                    ErrorDetails er = new ErrorDetails();
                    er.FileExists = existFiles;
                    er.Code = "400";
                    er.Message = "File Already Exists";
                    uploadResponse.Error = er;
                }
            }
            catch (Exception ex) { throw ex; }
            return uploadResponse;
        }

        // Returns the image
        public virtual FileStreamResult GetImage(string path, string id, bool allowCompress, ImageSize size, params FileManagerDirectoryContent[] data)
        {
            try
            {
                GetBucketList();
                ListingObjectsAsync("/", RootName.Replace("/", "") + path, false).Wait();
                string fileName = path.ToString().Split("/").Last();
                Stream stream = fileTransferUtility.OpenStream(bucketName, RootName.Replace("/", "") + path);
                return new FileStreamResult(stream, "APPLICATION/octet-stream");
            }
            catch (Exception ex) { throw ex; }
        }

        // Download file(s) or folder(s)
        public virtual FileStreamResult Download(string path, string[] Names, params FileManagerDirectoryContent[] data)
        {
            GetBucketList();
            FileStreamResult fileStreamResult = null;
            if (Names.Length == 1)
            {
                GetBucketList();
                ListingObjectsAsync("/", RootName.Replace("/", "") + path + Names[0], false).Wait();
            }
            if (Names.Length == 1 && response.CommonPrefixes.Count == 0)
            {
                try
                {
                    GetBucketList();
                    ListingObjectsAsync("/", RootName.Replace("/", "") + path, false).Wait();
                    Stream stream = fileTransferUtility.OpenStream(bucketName, RootName.Replace("/", "") + path + Names[0]);
                    fileStreamResult = new FileStreamResult(stream, "APPLICATION/octet-stream");
                    fileStreamResult.FileDownloadName = Names[0].Contains("/") ? Names[0].Split("/").Last() : Names[0];
                }
                catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
            }
            else
            {
                try
                {
                    string tempFolder = Path.Combine(Path.GetTempPath(), "tempFolder");
                    if (System.IO.File.Exists(tempFolder)) System.IO.File.Delete(tempFolder); else if (Directory.Exists(tempFolder)) Directory.Delete(tempFolder, true);
                    Directory.CreateDirectory(tempFolder);
                    foreach (string folderName in Names)
                    {
                        string fileName = null;
                        fileName = (Names[0].Contains("/")) ? Path.Combine(tempFolder, folderName.Split("/").Last()) : Path.Combine(tempFolder, folderName.Split("/").Last());
                        GetBucketList();
                        ListingObjectsAsync("/", RootName.Replace("/", "") + path + folderName, false).Wait();
                        if (response.CommonPrefixes.Count == 0)
                        {
                            if (Directory.Exists(fileName)) Directory.Delete(fileName); else if (System.IO.File.Exists(fileName)) System.IO.File.Delete(fileName);
                            FileStream fs = System.IO.File.Create(fileName);
                            fs.Close();
                            fileTransferUtility.Download(fileName, bucketName, RootName.Replace("/", "") + path + folderName);
                        }
                        else
                        {
                            if (System.IO.File.Exists(fileName)) System.IO.File.Delete(fileName); else if (Directory.Exists(fileName)) Directory.Delete(fileName, true);
                            Directory.CreateDirectory(fileName);
                            if (folderName.Contains("/"))
                                fileTransferUtility.DownloadDirectory(bucketName, RootName.Replace("/", "") + path + (String.IsNullOrEmpty(Path.GetExtension(folderName.Split("/").Last())) ? folderName + "/" : folderName), fileName);
                            else
                                fileTransferUtility.DownloadDirectory(bucketName, RootName.Replace("/", "") + path + folderName, fileName);
                        }
                    }
                    string tempPath = Path.Combine(Path.GetTempPath(), "tempFolder.zip");
                    ZipFile.CreateFromDirectory(tempFolder, tempPath);
                    FileStream fileStreamInput = new FileStream(tempPath, FileMode.Open, FileAccess.Read, FileShare.Delete);
                    fileStreamResult = new FileStreamResult(fileStreamInput, "APPLICATION/octet-stream");
                    fileStreamResult.FileDownloadName = "Files.zip";
                    if (System.IO.File.Exists(Path.Combine(Path.GetTempPath(), "tempFolder.zip"))) System.IO.File.Delete(Path.Combine(Path.GetTempPath(), "tempFolder.zip"));
                    if (System.IO.File.Exists(tempFolder)) System.IO.File.Delete(tempFolder); else if (Directory.Exists(tempFolder)) Directory.Delete(tempFolder, true);
                }
                catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
            }
            return fileStreamResult;
        }

        // Deletes a Directory
        public async Task DeleteDirectory(string path, string[] names)
        {
            try
            {
                GetBucketList();
                DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest() { BucketName = bucketName };
                foreach (string name in names)
                {
                    ListObjectsRequest listObjectsRequest = new ListObjectsRequest { BucketName = bucketName, Prefix = RootName.Replace("/", "") + path + name + (String.IsNullOrEmpty(Path.GetExtension(name)) ? "/" : ""), Delimiter = String.IsNullOrEmpty(Path.GetExtension(name)) ? null : "/" };
                    ListObjectsResponse listObjectsResponse = await client.ListObjectsAsync(listObjectsRequest);
                    foreach (S3Object s3Object in listObjectsResponse.S3Objects) { deleteObjectsRequest.AddKey(s3Object.Key); }
                }
                await client.DeleteObjectsAsync(deleteObjectsRequest);
                ListingObjectsAsync("/", RootName.Replace("/", "") + path + names[0], false).Wait();
            }
            catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
        }

        //Find all keys with a prefex of sourceKey, and rename them with destinationKey for prefix
        public async Task MoveDirectoryAsync(string sourceKey, string destinationKey, bool isFile, bool deleteS3Objects)
        {
            try
            {
                DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest() { BucketName = bucketName };
                ListObjectsRequest listObjectsRequest = new ListObjectsRequest { BucketName = bucketName, Prefix = !isFile ? sourceKey : sourceKey.Substring(0, sourceKey.Length - 1), Delimiter = !isFile ? null : "/" };
                do
                {
                    ListObjectsResponse listObjectsResponse = await client.ListObjectsAsync(listObjectsRequest);
                    foreach (S3Object s3Object in listObjectsResponse.S3Objects)
                    {
                        string newKey = s3Object.Key.Replace(!isFile ? sourceKey : sourceKey.Substring(0, sourceKey.Length - 1), !isFile ? destinationKey : destinationKey.Substring(0, destinationKey.Length - 1));
                        CopyObjectRequest copyObjectRequest = new CopyObjectRequest() { SourceBucket = bucketName, DestinationBucket = bucketName, SourceKey = s3Object.Key, DestinationKey = newKey };
                        CopyObjectResponse copyObectResponse = await client.CopyObjectAsync(copyObjectRequest);
                        if (deleteS3Objects) deleteObjectsRequest.AddKey(s3Object.Key);
                    }
                    if (listObjectsResponse.IsTruncated) listObjectsRequest.Marker = listObjectsResponse.NextMarker; else listObjectsRequest = null;
                } while (listObjectsRequest != null);
                await client.DeleteObjectsAsync(deleteObjectsRequest);
            }
            catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
        }

        // Gets the child  file(s) or directories details within a directory & Calculates the folder size value
        private void getChildObjects(List<string> commonPrefixes, bool isDetailsRequest, string searchString)
        {
            try
            {
                foreach (string commonPrefix in commonPrefixes)
                {
                    ListingObjectsAsync("/", commonPrefix, false).Wait();
                    char[] j = new Char[] { '*' };
                    foreach (S3Object s3Key in response.S3Objects)
                    {
                        if (isDetailsRequest)
                            sizeValue = sizeValue + s3Key.Size;
                        else if (s3Key.Key != RootName && s3Key.Key.Split("/")[s3Key.Key.Split("/").Length - 1].ToLower().Contains(searchString.TrimStart(j).TrimEnd(j).ToLower()))
                        {
                            FileManagerDirectoryContent innerFiles = CreateDirectoryContentInstance(s3Key.Key.Split("/").Last(), true, Path.GetExtension(s3Key.Key.ToString()), s3Key.Size, s3Key.LastModified, s3Key.LastModified, false, s3Key.Key.Substring(0, s3Key.Key.Length - s3Key.Key.Split("/")[s3Key.Key.Split("/").Length - 1].Length).Substring(RootName.Length - 1));
                            s3ObjectFiles.Add(innerFiles);
                        }
                    }
                    if (response.CommonPrefixes.Count > 0)
                    {
                        List<FileManagerDirectoryContent> innerFiles = response.CommonPrefixes.Where(x => x.Split("/")[x.Split("/").Length - 2].ToLower().Contains(searchString.TrimStart(j).TrimEnd(j).ToLower())).Select(x =>
                        CreateDirectoryContentInstance(x.Split("/")[x.Split("/").Length - 2], false, "Folder", 0, new DateTime(), new DateTime(), this.checkChild(x), x.Substring(0, x.Length - x.Split("/")[x.Split("/").Length - 2].Length - 1).Substring(RootName.Length - 1))).ToList();
                        if (innerFiles.Count > 0) s3ObjectFiles = s3ObjectFiles != null ? s3ObjectFiles.Union(innerFiles).ToList() : innerFiles;
                        this.getChildObjects(response.CommonPrefixes, isDetailsRequest, searchString);
                    }
                }
            }
            catch (Exception ex) { throw ex; }
        }

        // Converts the bytes to definite size values
        public String byteConversion(long fileSize)
        {
            try
            {
                string[] index = { "B", "KB", "MB", "GB", "TB", "PB", "EB" }; //Longs run out around EB
                if (fileSize == 0) return "0 " + index[0];
                int loc = Convert.ToInt32(Math.Floor(Math.Log(Math.Abs(fileSize), 1024)));
                return (Math.Sign(fileSize) * (Math.Round(Math.Abs(fileSize) / Math.Pow(1024, loc), 1))).ToString() + " " + index[loc];
            }
            catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
        }

        public bool checkChild(string path)
        {
            try { ListingObjectsAsync("/", path, true).Wait(); } catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
            return childResponse.CommonPrefixes.Count > 0 ? true : false;
        }

        public static async Task ListingObjectsAsync(string delimiter, string prefix, bool childCheck)
        {
            try
            {
                ListObjectsRequest request = new ListObjectsRequest { BucketName = bucketName, Delimiter = delimiter, Prefix = prefix };
                if (childCheck)
                    childResponse = await client.ListObjectsAsync(request);
                else
                    response = await client.ListObjectsAsync(request);
            }
            catch (AmazonS3Exception amazonS3Exception) { throw amazonS3Exception; }
        }
        public string ToCamelCase(FileManagerResponse userData)
        {
            return JsonConvert.SerializeObject(userData, new JsonSerializerSettings { ContractResolver = new DefaultContractResolver { NamingStrategy = new CamelCaseNamingStrategy() } });
        }
    }
}
