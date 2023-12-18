import CustomAxios from "../redux/customAxios";
import { createRequestHeader } from "../redux/utils/RequestHeaders";

interface FileUploadHelperProps {
  uploadUrl: string;
  retryDelays: number[];
  metadata: {
    filename: string;
    filetype: string;
  };
  onError: (err) => void;
  onProgress: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess: () => void;
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

    let offset;

    const apiList = fileUploadData.upload.parts.map((part, i) => {
      const start = fileUploadData.upload.parts
        .slice(0, i)
        .map((p) => p.size)
        .reduce((sum, size) => sum + size, 0);
      const end = start + part.size;
      const chunk = this.file.slice(start, end);
      return () =>
        CustomAxios().put(part.url, chunk, {
          // headers: {
          //     'Content-Type': undefined,
          // }
        });
    });

    for (const prom of apiList) {
      try {
        const res = await prom();
        console.log(res);
      } catch (e) {
        console.log(e);
        throw e;
      }
    }
  };

  stop = async () => {};
}
