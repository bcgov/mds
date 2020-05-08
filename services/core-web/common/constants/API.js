import queryString from "query-string";

export const CORE_STATIC_CONTENT = "/exports/core-static-content";
// Network URL's
export const MINE = "/mines";
export const MINE_LIST = "/mines";
export const SUBSCRIPTION = (mineGuid) => `/mines/${mineGuid}/subscribe`;
export const MINE_SUBSCRIPTION = "/mines/subscribe";
export const MINE_LIST_QUERY = (params) => `/mines${params}`;
export const PARTIES_LIST_QUERY = (params = {}) => `/parties?${queryString.stringify(params)}`;
export const MINE_MAP_LIST = "/mines/map-list";
export const MINE_BASIC_INFO_LIST = `/mines/basicinfo`;
export const PARTY = "/parties";
export const MANAGER = "/parties/managers";
export const PARTY_RELATIONSHIP = "/parties/mines";
export const PARTY_ORGBOOK_ENTITY = (partyGuid) => `/parties/${partyGuid}/orgbook-entity`;
export const PERMITTEE = "/permits/permittees";
export const MINE_NAME_LIST = (params = {}) => `/mines/search?${queryString.stringify(params)}`;
export const MINE_STATUS = "/mines/status";
export const MINE_REGION = "/mines/region";
export const MINE_COMPLIANCE_SUMMARY = (mine_guid) => `/mines/${mine_guid}/compliance/summary`;
export const MINE_TSF = (mine_guid) => `/mines/${mine_guid}/tailings`;
export const DISTURBANCE_CODES = "/mines/disturbance-codes";
export const COMMODITY_CODES = "/mines/commodity-codes";
export const EDIT_TSF_REPORT = "";
export const MINE_DOCUMENTS = (mine_guid) => `/mines/${mine_guid}/documents`;
export const MINE_TSF_REQUIRED_DOCUMENTS = "/required-documents?category=TSF";
export const MINE_TENURE_TYPES = "/mines/mine-tenure-type-codes";
export const MINE_TYPES = (mineGuid) => `/mines/${mineGuid}/mine-types`;
export const MINE_TYPES_DETAILS = "/mines/mine-types/details";
export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_TOKEN_GET_URL = (documentManagerGuid) =>
  `/download-token/${documentManagerGuid}`;
export const MINESPACE_USER = "/users/minespace";
export const PROVINCE_CODES = "/parties/sub-division-codes";

export const MINE_VERIFIED_STATUSES = (params = {}) =>
  `/mines/verified-status?${queryString.stringify(params)}`;
export const MINE_VERIFIED_STATUS = (mine_guid) => `/mines/${mine_guid}/verified-status`;

// Permits
export const PERMITSTATUSCODES = () => `/mines/permits/status-codes`;
export const PERMITS = (mineGuid) => `/mines/${mineGuid}/permits`;
export const PERMITAMENDMENTS = (mineGuid, permitGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments`;
export const PERMITAMENDMENT = (mineGuid, permitGuid, permitAmendmentGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}`;
export const PERMITAMENDMENTDOCUMENT = (mineGuid, permitGuid, permitAmendmentGuid, documentGuid) =>
  `/mines/${mineGuid}/permits/${permitGuid}/amendments/${permitAmendmentGuid}/documents/${documentGuid}`;

// Search
export const SEARCH = (params) => (params ? `/search?${queryString.stringify(params)}` : "/search");
export const SEARCH_OPTIONS = "/search/options";
export const SIMPLE_SEARCH = "/search/simple";

// Reporting
export const DASHBOARD = (dashboardId) => `/reporting/dashboard/${dashboardId}`;

// Variances
export const COMPLIANCE_CODES = "/compliance/codes";
export const MINE_VARIANCES = (mineGuid) => `/mines/${mineGuid}/variances`;
export const VARIANCES = (params = {}) => `/variances?${queryString.stringify(params)}`;
export const VARIANCE = (mineGuid, varianceGuid) => `/mines/${mineGuid}/variances/${varianceGuid}`;
export const VARIANCE_DOCUMENTS = (mineGuid, varianceGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents`;
export const VARIANCE_DOCUMENT = (mineGuid, varianceGuid, documentManagerGuid) =>
  `/mines/${mineGuid}/variances/${varianceGuid}/documents/${documentManagerGuid}`;
export const VARIANCE_STATUS_CODES = "/variances/status-codes";
export const VARIANCE_DOCUMENT_CATEGORY_OPTIONS = "/variances/document-categories";

// Users
export const CORE_USER = "/users/core";

// Incidents
export const MINE_INCIDENTS = (mine_guid) => `/mines/${mine_guid}/incidents`;
export const MINE_INCIDENT = (mineGuid, mine_incident_guid) =>
  `/mines/${mineGuid}/incidents/${mine_incident_guid}`;
export const MINE_INCIDENT_DOCUMENT = (mineGuid) => `/mines/${mineGuid}/incidents/documents`;

export const INCIDENTS = (params = {}) => `/incidents?${queryString.stringify(params)}`;

export const INCIDENT_FOLLOWUP_ACTIONS = `/incidents/followup-types`;
export const INCIDENT_DETERMINATION_TYPES = `/incidents/determination-types`;
export const INCIDENT_STATUS_CODES = `/incidents/status-codes`;
export const INCIDENT_DOCUMENT_TYPE = `/incidents/document-types`;
export const INCIDENT_CATEGORY_CODES = `/incidents/category-codes`;

// Reports
export const REPORTS = (params = {}) => `/mines/reports?${queryString.stringify(params)}`;
export const MINE_REPORT_DEFINITIONS = () => `/mines/reports/definitions`;
export const MINE_REPORTS = (mineGuid) => `/mines/${mineGuid}/reports`;
export const MINE_REPORT = (mineGuid, mineReportGuid) =>
  `/mines/${mineGuid}/reports/${mineReportGuid}`;
export const MINE_REPORT_DOCUMENT = (mineGuid) => `/mines/${mineGuid}/reports/documents`;
export const MINE_REPORT_COMMENTS = (mineGuid, reportGuid) =>
  `/mines/${mineGuid}/reports/${reportGuid}/comments`;
export const MINE_REPORT_COMMENT = (mineGuid, reportGuid, commentGuid) =>
  `/mines/${mineGuid}/reports/${reportGuid}/comments/${commentGuid}`;
export const MINE_REPORT_STATUS = "/mines/reports/status-codes";
export const MINE_REPORT_CATEGORY = "/mines/reports/category-codes";

// Notice Of Work
export const NOTICE_OF_WORK_APPLICATION_LIST = (params = {}) =>
  `/now-applications?${queryString.stringify(params)}`;
export const NOTICE_OF_WORK_APPLICATION = (applicationGuid) =>
  `/now-applications/${applicationGuid}`;
export const NOTICE_OF_WORK_DOCUMENT_FILE_GET_URL = (id, applicationGuid, token = {}) =>
  `/now-submissions/applications/${applicationGuid}/document/${id}?${queryString.stringify(token)}`;
export const NOTICE_OF_WORK_DOCUMENT_TOKEN_GET_URL = (id, applicationGuid) =>
  `/now-submissions/applications/${applicationGuid}/document/${id}/token`;
export const NOTICE_OF_WORK_APPLICATION_IMPORT = (applicationGuid) =>
  `/now-applications/${applicationGuid}/import`;
export const NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS = "/now-applications/activity-types";
export const NOTICE_OF_WORK_UNIT_TYPE_OPTIONS = "/now-applications/unit-types";
export const NOTICE_OF_WORK_APPLICATION_TYPE_OPTIONS = "/now-applications/application-types";
export const NOTICE_OF_WORK_APPLICATION_STATUS_OPTIONS =
  "/now-applications/application-status-codes";
export const NOW_APPLICATION_DOCUMENT_TYPE_OPTIONS = "/now-applications/application-document-types";
export const NOW_UNDERGROUND_EXPLORATION_TYPE_OPTIONS =
  "/now-applications/underground-exploration-types";
export const NOTICE_OF_WORK_APPLICATION_PROGRESS = (applicationGuid) =>
  `/now-applications/${applicationGuid}/progress`;
export const NOTICE_OF_WORK_APPLICATION_REVIEW = (applicationGuid) =>
  `/now-applications/${applicationGuid}/reviews`;
export const NOTICE_OF_WORK_APPLICATION_REVIEW_TYPES = `/now-applications/review-types`;
export const NOW_APPLICATION_PROGRESS_STATUS_CODES =
  "/now-applications/application-progress-status-codes";
export const NOTICE_OF_WORK_DOCUMENT = (now_document_guid) =>
  `/now-applications/${now_document_guid}/document`;
export const NOW_APPLICATION_PERMIT_TYPES = "/now-applications/application-permit-types";

// Mine Party Appointments
export const MINE_PARTY_APPOINTMENT_DOCUMENTS = (mineGuid, minePartyAppointmentGuid) =>
  `/mines/${mineGuid}/party-appts/${minePartyAppointmentGuid}/documents`;

export const NRIS_DOCUMENT_TOKEN_GET_URL = (externalId, inspectionId, file_name) =>
  `/compliance/inspection/${inspectionId}/document/${externalId}/token?${queryString.stringify({
    file_name,
  })}`;
export const NRIS_DOCUMENT_FILE_GET_URL = (externalId, inspectionId, token) =>
  `/compliance/inspection/${inspectionId}/document/${externalId}?${queryString.stringify(token)}`;

export const MINE_BONDS = (mineGuid) => `/securities/bonds?mine_guid=${mineGuid}`;
export const BOND = (bondGuid) =>
  bondGuid ? `/securities/bonds/${bondGuid}` : "/securities/bonds";
export const BOND_DOCUMENTS = (mineGuid) => `/securities/${mineGuid}/bonds/documents`;
export const MINE_RECLAMATION_INVOICES = (mineGuid) =>
  `/securities/reclamation-invoices?mine_guid=${mineGuid}`;
export const RECLAMATION_INVOICE = (invoiceGuid) =>
  invoiceGuid
    ? `/securities/reclamation-invoices/${invoiceGuid}`
    : "/securities/reclamation-invoices";
export const RECLAMATION_INVOICE_DOCUMENTS = (mineGuid) =>
  `/securities/${mineGuid}/reclamation-invoices/documents`;

export const MINE_COMMENTS = (mineGuid) => `/mines/${mineGuid}/comments`;
export const MINE_COMMENT = (mineGuid, commentGuid) => `/mines/${mineGuid}/comments/${commentGuid}`;

// OrgBook
export const ORGBOOK_SEARCH = (search) => `/orgbook/search?${queryString.stringify({ search })}`;
export const ORGBOOK_CREDENTIAL = (credentialId) => `/orgbook/credential/${credentialId}`;
