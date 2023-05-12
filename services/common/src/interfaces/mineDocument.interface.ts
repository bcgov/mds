export interface IMineDocument {
  mine_document_guid: string;
  mine_document_id: number;
  mine_guid: string;
  document_manager_guid: string;
  document_name: string;
  document_date?: Date;
  document_class?: string;
  upload_date: Date;
  mine_name: string;
}
