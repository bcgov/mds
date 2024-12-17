import { NoDTypeSaveEnum } from "@mds/common/constants";
import { IDocument } from "../document/document.interface";

export interface INoDDocument extends IDocument {
  create_timestamp: string;
  create_user: string;
  document_type: NoDTypeSaveEnum;
  upload_date?: string;
}
