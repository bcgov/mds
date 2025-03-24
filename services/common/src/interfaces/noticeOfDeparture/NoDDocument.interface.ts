import { IDocument } from "../document/document.interface";

export interface INoDDocument extends IDocument {
  create_timestamp: string;
  create_user: string;
  document_type: string;
  upload_date?: string;
}
