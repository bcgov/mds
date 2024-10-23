export type UploadResult = { part: MultipartUploadPart; etag?: string | null; status: string };

export interface FileUploadHelperProps {
  uploadUrl: string;

  metadata: {
    filename: string;
    filetype: string;
    maxfilenamelength: string;
  };
  uploadResults?: UploadResult[];
  uploadData?: MultipartDocumentUpload;
  onError: (err, uploadResults: UploadResult[]) => void;
  onProgress: (bytesUploaded: number, bytesTotal: number) => void;
  onSuccess: (documentManagerGuid: string, documentManagerVersionGuid?: string) => void;
  onInit?: (uploadData: MultipartDocumentUpload) => void;
  onUploadResponse?: (data: MultipartDocumentUpload) => void;
  retryDelayMs?: number;
}

export interface MultipartUploadPart {
  part: number;
  size: number;
  url: string;
}

interface MultipartUpload {
  uploadId: string;
  parts: MultipartUploadPart[];
}

export interface MultipartDocumentUpload {
  document_manager_guid: string;
  document_manager_version_guid: string;
  upload: MultipartUpload;
}
