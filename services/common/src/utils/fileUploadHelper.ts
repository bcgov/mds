import { COMPLETE_MULTIPART_UPLOAD, ENVIRONMENT } from "../constants";
import CustomAxios from "../redux/customAxios";
import { createRequestHeader } from "../redux/utils/RequestHeaders";
import axios from "axios";
import pLimit from "p-limit";
interface FileUploadHelperProps {
  uploadUrl: string;
  retryDelays: number[];
  metadata: {
    filename: string;
    filetype: string;
  };
  onError: (err) => void;
  onProgress: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess: (documentManagerGuid: string) => void;
}

interface MultipartUploadPart {
  part: number;
  size: number;
  url: string;
}

interface MultipartUpload {
  uploadId: string;
  parts: MultipartUploadPart[];
}

interface FileUploadPayload {
  document_manager_guid: string;
  document_manager_version_guid: string;
  upload: MultipartUpload;
}

const encodeUploadMetadata = (metadata: { [key: string]: string }) => {
  return Object.entries(metadata)
    .map(([k, v]) => `${k} ${btoa(v)}`)
    .join(",");
};

export class FileUploadHelper {
  file: File;

  config: FileUploadHelperProps;

  constructor(file: File, config: FileUploadHelperProps) {
    this.file = file;
    this.config = config;
  }

  start = async () => {
    const headers = createRequestHeader({
      "Upload-Length": `${this.file.size}`,
      // "Content-Type": this.file.type,
      Filename: this.file.name,
      "Upload-Metadata": encodeUploadMetadata(this.config.metadata),
      "Upload-Protocol": "s3-multipart",
    });
    console.log(headers);
    const fileUploadResponse = await CustomAxios().post(this.config.uploadUrl, null, headers);
    console.log(fileUploadResponse);
    const fileUploadData: FileUploadPayload = fileUploadResponse.data;

    console.log("Got a response", fileUploadData);

    const bytesUploaded: { [key: number]: number } = {};

    const limitParallel = pLimit(4);

    const totalBytesUploaded = () =>
      Object.values(bytesUploaded).reduce((total: number, c: number) => total + c, 0);

    const apiList = fileUploadData.upload.parts.map((part, i) => {
      const start = fileUploadData.upload.parts
        .slice(0, i)
        .map((p) => p.size)
        .reduce((sum, size) => sum + size, 0);
      const end = start + part.size;
      const chunk = this.file.slice(start, end);
      return limitParallel(async () => {
        const res = await axios.put(part.url, chunk, {
          headers: {
            "Content-Type": "",
          },
          onUploadProgress: (progressEvent) => {
            bytesUploaded[i] = progressEvent.loaded;

            this.config.onProgress(totalBytesUploaded(), this.file.size);
          },
        });

        return {
          part: part.part,
          etag: res.headers.etag,
        };
      });
    });

    const res = await Promise.all(apiList);

    console.log(res);

    const payload = {
      upload_id: fileUploadData.upload.uploadId,
      parts: res.map((part) => ({ part: part.part, etag: part.etag })),
    };

    await CustomAxios().patch(
      ENVIRONMENT.docManUrl + COMPLETE_MULTIPART_UPLOAD(fileUploadData.document_manager_guid),
      payload,
      createRequestHeader()
    );

    this.config.onSuccess(fileUploadData.document_manager_guid);
  };

  stop = async () => {};
}
