import { COMPLETE_MULTIPART_UPLOAD, ENVIRONMENT } from "../constants";
import CustomAxios from "../redux/customAxios";
import { createRequestHeader } from "../redux/utils/RequestHeaders";
import pLimit, { Limit } from "p-limit";
import {
  FileUploadHelperProps,
  UploadResult,
  MultipartDocumentUpload,
  MultipartUploadPart,
} from "./fileUploadHelper.interface";
import { retryOnFail } from "./retry";

/**
 * Encodes the given metadata to be sent to the document manager.
 * @param metadata The metadata to encode
 * @returns The encoded metadata
 */
const encodeUploadMetadata = (metadata: { [key: string]: string }) => {
  return Object.entries(metadata)
    .map(([k, v]) => `${k} ${btoa(v)}`)
    .join(",");
};

/**
 * Helper class for uploading files to S3.
 */
export class FileUploadHelper {
  file: File;
  config: FileUploadHelperProps;
  limitParallel: Limit;

  constructor(file: File, config: FileUploadHelperProps) {
    this.file = file;
    this.config = config;

    // Limit the number of concurrent uploads to 4
    this.limitParallel = pLimit(4);
  }

  /**
   * Starts the multipart upload process.
   *
   * If uploadData is not provided, a new multipart upload will be initiated.
   *
   * If uploadResults is provided, the upload will resume from the last part that
   * was uploaded.
   */
  start = async () => {
    let uploadResults: UploadResult[] = this.config.uploadResults || [];
    let uploadData: MultipartDocumentUpload = this.config.uploadData;

    // Keep track of how many bytes have been uploaded for each part
    let bytesUploaded: { [key: number]: number } = {};

    const totalBytesUploaded = () =>
      Object.values(bytesUploaded).reduce((total: number, c: number) => total + c, 0);

    if (!this.config.uploadData) {
      console.log("creating multipart upload");
      uploadData = await this._createMultipartUpload();
    }

    uploadResults = uploadResults.filter((r) => r.status === "success");

    if (uploadResults?.length) {
      // If we have already uploaded some parts, we need to update the bytesUploaded
      bytesUploaded = uploadResults.reduce((acc, result) => {
        acc[result.part.part] = result.part.size;
        return acc;
      }, {});

      this.config.onProgress(totalBytesUploaded(), this.file.size);
    }

    // Filter out any parts that have already been uploaded
    const unfinishedParts = uploadData.upload.parts.filter(
      (p) => !uploadResults.some((r) => p.part === r.part.part)
    );

    console.log("upload primizes");
    // Upload the remaining parts
    const uploadPromises = unfinishedParts.map((result) => {
      const chunk = this._parseFileChunk(uploadData.upload.parts, result);
      console.log("uploading chunk");
      return this._uploadMultipartChunk(
        result,
        chunk,
        bytesUploaded,
        totalBytesUploaded,
        uploadResults
      );
    });

    await Promise.allSettled(uploadPromises);

    console.log("completing upload");
    // If all parts have been uploaded, complete the multipart upload
    if (uploadResults?.length && uploadResults.every((result) => result.status === "success")) {
      await this._completeMultipartUpload(uploadData, uploadResults);

      this.config.onSuccess(uploadData.document_manager_guid);
    }
  };

  abort = () => {
    this.limitParallel.clearQueue();
  };

  private async _completeMultipartUpload(
    uploadData: MultipartDocumentUpload,
    uploadResults: UploadResult[]
  ) {
    const payload = {
      upload_id: uploadData.upload.uploadId,
      parts: uploadResults.map((result) => ({ part: result.part.part, etag: result.etag })),
    };

    await CustomAxios().patch(
      ENVIRONMENT.docManUrl + COMPLETE_MULTIPART_UPLOAD(uploadData.document_manager_guid),
      payload,
      createRequestHeader()
    );
  }

  private _createMultipartUpload = async (): Promise<MultipartDocumentUpload> => {
    const headers = createRequestHeader({
      "Upload-Length": `${this.file.size}`,
      // "Content-Type": this.file.type,
      Filename: this.file.name,
      "Upload-Metadata": encodeUploadMetadata(this.config.metadata),
      "Upload-Protocol": "s3-multipart",
    });

    const fileUploadResponse = await CustomAxios().post(this.config.uploadUrl, null, headers);
    this.config.onInit(<MultipartDocumentUpload>fileUploadResponse.data);

    return <MultipartDocumentUpload>fileUploadResponse.data;
  };

  private _uploadMultipartChunk(
    result: MultipartUploadPart,
    chunk: Blob,
    bytesUploaded: { [key: number]: number },
    totalBytesUploaded: () => number,
    uploadResults: UploadResult[]
  ): Promise<any> {
    return this.limitParallel(async () => {
      try {
        console.log("uploading");

        // Retry the upload of the given chunk up to 4 times before failing hard
        return await retryOnFail(
          async () => {
            const res = await CustomAxios().put(result.url, chunk, {
              headers: {
                "Content-Type": "",
              },
              onUploadProgress: (progressEvent) => {
                bytesUploaded[result.part] = progressEvent.loaded;

                this.config.onProgress(totalBytesUploaded(), this.file.size);
              },
            });

            uploadResults.push({ part: result, etag: res.headers.etag, status: "success" });
          },
          4,
          this.config.retryDelayMs || 500
        );
      } catch (e) {
        console.log("error when uploading");
        uploadResults.push({ part: result, etag: null, status: "error" });

        this.limitParallel.clearQueue();
        this.config.onError(e, uploadResults);
      }
    });
  }

  /**
   * Returns a chunk of the file to be uploaded based on the part number and the size of the part.
   */
  private _parseFileChunk(fileParts: MultipartUploadPart[], part: MultipartUploadPart): Blob {
    // The start of the current chunk is the sum of the sizes of all the previous parts
    const start = fileParts
      .slice(0, part.part - 1)
      .map((p) => p.size)
      .reduce((sum, size) => sum + size, 0);
    const end = start + part.size;
    const chunk = this.file.slice(start, end);
    return chunk;
  }
}
