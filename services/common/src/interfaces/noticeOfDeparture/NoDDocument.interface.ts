import { NoDTypeSaveEnum } from "@/constants";
import { IDocument } from "@/index";

export interface INoDDocument extends IDocument {
  create_timestamp: string;
  create_user: string;
  document_type: NoDTypeSaveEnum;
  upload_date?: string;
}
