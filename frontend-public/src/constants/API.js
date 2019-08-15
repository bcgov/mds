// Network URL's
import queryString from "query-string";

export const MINE = "/mines";
export const USER_MINE_INFO = "/mines/search";

export const DOCUMENT_STATUS = "/documents/expected/status";
export const MINE_DOCUMENTS = (mine_guid) => `/mines/${mine_guid}/documents`;
export const UPLOAD_MINE_EXPECTED_DOCUMENT_FILE = (expectedDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document`;
export const EXPECTED_DOCUMENT = "/documents/expected";
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;

export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_TOKEN_GET_URL = (documentManagerGuid) =>
  `/download-token/${documentManagerGuid}`;

// variances
export const COMPLIANCE_CODES = "/mines/compliance/codes";
export const VARIANCES = (mineGuid) => `/mines/${mineGuid}/variances`;
export const VARIANCE = (mineGuid, varianceGuid) => `/mines/${mineGuid}/variances/${varianceGuid}`;
export const VARIANCE_DOCUMENTS = (mineGuid, varianceGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents`;
export const VARIANCE_DOCUMENT = (mineGuid, varianceGuid, documentManagerGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents/${documentManagerGuid}`;
export const VARIANCE_STATUS_CODES = "/variances/status-codes";

// Reports
export const MINE_REPORT_DEFINITIONS = () => `/mines/reports/definitions`;
export const MINE_REPORTS = (mine_guid) => `/mines/${mine_guid}/reports`;
export const MINE_REPORT = (mine_guid, mine_report_guid) =>
  `/mines/${mine_guid}/reports/${mine_report_guid}`;
export const MINE_REPORT_DOCUMENT = (mineGuid) => `/mines/${mineGuid}/reports/documents`;
