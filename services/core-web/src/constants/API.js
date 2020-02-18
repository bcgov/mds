import queryString from "query-string";

// Document Generation: Notices of Work
export const NOTICE_OF_WORK_APPLICATION_DOCUMENT = (token) =>
  `/document-generation/now?${queryString.stringify(token)}`;
export const NOTICE_OF_WORK_APPLICATION_DOCUMENT_GENERATION = (documentTypeCode) =>
  `/document-generation/now/${documentTypeCode}`;
