export interface INodDocumentPayload {
  document_type: string;
  document_manager_guid: string;
  document_name: string;
}

export interface INodDocument extends INodDocumentPayload {
  create_timestamp: string;
}
