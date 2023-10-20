import { IMineDocumentVersion } from "@mds/common/index";

export interface IMineDocument {
  mine_document_guid: string;
  mine_guid: string;
  document_manager_guid: string;
  document_name: string;
  upload_date: string;
  create_user: string;
  is_archived?: boolean;
  archived_date?: string;
  archived_by?: string;
  active_ind?: boolean;
  versions?: IMineDocumentVersion[];
}
