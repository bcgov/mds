import { FileUploadHelper } from "./fileUploadHelper";
import { FileUploadHelperProps, MultipartDocumentUpload } from "./fileUploadHelper.interface";

import axios from "axios";
jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.create = jest.fn(() => mockedAxios);
mockedAxios.interceptors = {
  request: {
    use: jest.fn(),
    eject: jest.fn(),
  },
  response: {
    use: jest.fn(),
    eject: jest.fn(),
  },
};

describe("FileUploadHelper", () => {
  const file = new File(["file content"], "filename.test");
  const config: FileUploadHelperProps = {
    uploadUrl: "http://example.com/upload",
    onInit: jest.fn(),
    onProgress: jest.fn(),
    onSuccess: jest.fn(),
    onError: jest.fn(),
    retryDelayMs: 5,
    metadata: { filename: "filename", filetype: "filetype" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("start", () => {
    it("should create a new multipart upload if uploadData is not provided", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "",
        upload: { uploadId: "uploadId", parts: [{ part: 1, size: 100, url: "part1-url" }] },
      };

      mockedAxios.post.mockResolvedValueOnce({ data: uploadData });
      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagabc" } });
      mockedAxios.patch.mockResolvedValueOnce({});

      const fileUploadHelper = new FileUploadHelper(file, config);
      await fileUploadHelper.start();

      expect(config.onInit).toHaveBeenCalledWith(uploadData);

      expect(mockedAxios.post).toHaveBeenCalledWith(config.uploadUrl, null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Upload-Length": `${file.size}`,
          Filename: "filename.test",
          "Upload-Metadata": "filename ZmlsZW5hbWU=,filetype ZmlsZXR5cGU=",
          "Upload-Protocol": "s3-multipart",
          Authorization: "Bearer undefined",
        },
      });

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part1-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(config.onSuccess).toHaveBeenCalledWith(uploadData.document_manager_guid, "");
    });

    it("should retry parts when uploadResults is provided", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "",
        upload: { uploadId: "uploadId", parts: [{ part: 1, size: 100, url: "part1-url" }] },
      };
      const uploadResults = [];
      config.uploadData = uploadData;
      config.uploadResults = uploadResults;

      const fileUploadHelper = new FileUploadHelper(file, config);

      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagabc" } });
      mockedAxios.patch.mockResolvedValueOnce({});

      await fileUploadHelper.start();

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part1-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(config.onSuccess).toHaveBeenCalledWith(uploadData.document_manager_guid, "");
    });

    it("should not upload successful parts when retrying", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "versionguid",
        upload: {
          uploadId: "uploadId",
          parts: [
            { part: 1, size: 100, url: "part1-url" },
            { part: 2, size: 200, url: "part2-url" },
          ],
        },
      };
      const uploadResults = [
        { part: { part: 1, size: 100, url: "part1-url" }, etag: "etag", status: "success" },
      ];
      config.uploadData = uploadData;
      config.uploadResults = uploadResults;

      const fileUploadHelper = new FileUploadHelper(file, config);

      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagabc" } });
      mockedAxios.patch.mockResolvedValueOnce({});

      await fileUploadHelper.start();

      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part2-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);

      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(config.onSuccess).toHaveBeenCalledWith(
        uploadData.document_manager_guid,
        "versionguid"
      );
    });

    it("should abort the upload if a part fails to upload", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "versionguid",
        upload: { uploadId: "uploadId", parts: [{ part: 1, size: 100, url: "part1-url" }] },
      };
      const uploadResults = [
        { part: { part: 1, size: 100, url: "part1-url" }, etag: null, status: "error" },
      ];
      config.uploadData = uploadData;
      config.uploadResults = uploadResults;

      const fileUploadHelper = new FileUploadHelper(file, config);
      mockedAxios.post.mockResolvedValueOnce({ data: uploadData });
      mockedAxios.patch.mockResolvedValueOnce({});

      mockedAxios.put.mockRejectedValue(new Error("Failed"));
      await fileUploadHelper.start();

      expect(mockedAxios.put).toHaveBeenCalledTimes(5);
      expect(mockedAxios.patch).not.toHaveBeenCalled();
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(config.onError).toHaveBeenCalledWith(new Error("Failed"), uploadResults);
    });

    it("should only retry failed results", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "versionguid",
        upload: {
          uploadId: "uploadId",
          parts: [
            { part: 1, size: 100, url: "part1-url" },
            { part: 2, size: 200, url: "part2-url" },
          ],
        },
      };
      const uploadResults = [
        { part: { part: 1, size: 100, url: "part1-url" }, etag: null, status: "error" },
        { part: { part: 2, size: 100, url: "part2-url" }, etag: "etagpart2", status: "success" },
      ];
      config.uploadData = uploadData;
      config.uploadResults = uploadResults;

      const fileUploadHelper = new FileUploadHelper(file, config);
      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagpart1" } });
      mockedAxios.patch.mockResolvedValueOnce({});

      await fileUploadHelper.start();
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part1-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "<DOCUMENT_MANAGER_URL>/documents/guid/complete-upload",
        {
          upload_id: "uploadId",
          parts: [
            { etag: "etagpart1", part: 1 },
            { etag: "etagpart2", part: 2 },
          ],
          version_guid: "versionguid",
        },
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(config.onSuccess).toHaveBeenCalledWith(
        uploadData.document_manager_guid,
        "versionguid"
      );
    });
    it("should complete upload with parts in ascending order", async () => {
      const uploadData: MultipartDocumentUpload = {
        document_manager_guid: "guid",
        document_manager_version_guid: "versionguid",
        upload: {
          uploadId: "uploadId",
          parts: [
            { part: 2, size: 200, url: "part2-url" },
            { part: 3, size: 300, url: "part3-url" },
            { part: 1, size: 100, url: "part1-url" },
          ],
        },
      };
      const uploadResults = [
        { part: { part: 2, size: 100, url: "part2-url" }, etag: "etagpart2", status: "failed" },
        { part: { part: 3, size: 100, url: "part3-url" }, etag: "etagpart3", status: "failed" },
        { part: { part: 1, size: 100, url: "part1-url" }, etag: "etagpart1", status: "failed" },
      ];
      config.uploadData = uploadData;
      config.uploadResults = uploadResults;

      const fileUploadHelper = new FileUploadHelper(file, config);
      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagpart2" } });
      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagpart3" } });
      mockedAxios.put.mockResolvedValueOnce({ headers: { etag: "etagpart1" } });
      mockedAxios.patch.mockResolvedValueOnce({});

      await fileUploadHelper.start();
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part2-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part3-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledWith(
        "part1-url",
        expect.any(Blob),
        expect.any(Object)
      );
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        "<DOCUMENT_MANAGER_URL>/documents/guid/complete-upload",
        {
          upload_id: "uploadId",
          parts: [
            { etag: "etagpart1", part: 1 },
            { etag: "etagpart2", part: 2 },
            { etag: "etagpart3", part: 3 },
          ],
          version_guid: "versionguid",
        },
        expect.any(Object)
      );
      expect(mockedAxios.put).toHaveBeenCalledTimes(3);
      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).not.toHaveBeenCalled();
      expect(config.onSuccess).toHaveBeenCalledWith(
        uploadData.document_manager_guid,
        "versionguid"
      );
    });
  });
});
