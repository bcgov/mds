export interface IMineDocument {
  mine_document_guid: string;
  mine_guid: string;
  document_manager_guid: string;
  document_name: string;
  upload_date: Date;
  create_user: string;
  is_archived: boolean;
}
