// Network URL's
export const MINE_NAME_LIST = "/mines/names";
export const MINE = "/mines";

export const DOCUMENT_STATUS = "/documents/expected/status";
export const MINE_DOCUMENTS = "/documents/mines";
export const UPLOAD_MINE_EXPECTED_DOCUMENT_FILE = (expectedDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document`;
export const EXPECTED_DOCUMENT = "/documents/expected";
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;

export const DOCUMENT_MANAGER_FILE_GET_URL = "/document-manager";
