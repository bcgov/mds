export interface IImportNoWSubmissionDocument {
  import_now_submission_documents_job_id: number;
  document_id: number;
  submission_document_url: string;
  submission_document_file_name: string;
  submission_document_type: string;
  submission_document_message_id: number;
  error: string | null;
}

export interface IImportNoWSubmissionDocumentsJob {
  import_now_submission_documents_job_id: number;
  import_now_submission_documents_job_status_code: string;
  now_application_guid: string;
  attempt: number;
  start_timestamp: string;
  end_timestamp: string;
  next_attempt_timestamp?: string;
  import_now_submission_documents: IImportNoWSubmissionDocument[];
}
