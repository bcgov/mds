import { NoDTypeSaveEnum } from "@/constants";

export interface INoDDocument {
  create_timestamp: string;
  create_user: string;
  document_manager_guid: string;
  document_name: string;
  document_type: NoDTypeSaveEnum;
  mine_document_guid: string;
  mine_guid: string;
  upload_date?: string;
}
