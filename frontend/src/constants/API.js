import queryString from "query-string";

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
export const PERMITTEE = "/permits/permittees";
export const MINE_NAME_LIST = (params = {}) => `/mines/search?${queryString.stringify(params)}`;
export const MINE_STATUS = "/mines/status";
export const MINE_REGION = "/mines/region";
export const MINE_COMPLIANCE_INFO = "/mines/compliance";
export const MINE_COMPLIANCE_SUMMARY = (mine_guid) => `/mines/${mine_guid}/compliance/summary`;
export const MINE_TSF = (mine_guid) => `/mines/${mine_guid}/tailings`;
export const DISTURBANCE_CODES = "/mines/disturbance-codes";
export const COMMODITY_CODES = "/mines/commodity-codes";
export const EDIT_TSF_REPORT = "";
export const REMOVE_EXPECTED_DOCUMENT = "/documents/expected";
export const ADD_MINE_EXPECTED_DOCUMENT = "/documents/expected/mines";
export const UPLOAD_MINE_EXPECTED_DOCUMENT_FILE = (expectedDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document`;
export const DOCUMENT_STATUS = "/documents/expected/status";
export const MINE_DOCUMENTS = "/documents/mines";
export const MINE_TSF_REQUIRED_DOCUMENTS = "/documents/required?category=TSF";
export const EXPECTED_DOCUMENT = "/documents/expected";
export const MINE_TENURE_TYPES = "/mines/mine-tenure-type-codes";
export const MINE_TYPES = "/mines/mine-types";
export const MINE_TYPES_DETAILS = "/mines/mine-types/details";
export const DOCUMENT_MANAGER_FILE_GET_URL = (token = {}) =>
  `/documents?${queryString.stringify(token)}`;
export const DOCUMENT_MANAGER_TOKEN_GET_URL = (documentManagerGuid) =>
  `/download-token/${documentManagerGuid}`;
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;
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

export const APPLICATIONS = "/applications";

// Search
export const SEARCH = (params) => (params ? `/search?${queryString.stringify(params)}` : "/search");
export const SEARCH_OPTIONS = "/search/options";
export const SIMPLE_SEARCH = "/search/simple";

// Reporting
export const DASHBOARD = (dashboardId) => `/reporting/dashboard/${dashboardId}`;

// Variances
export const COMPLIANCE_CODES = "/mines/compliance/codes";
export const MINE_VARIANCES = (mineGuid) => `/mines/${mineGuid}/variances`;
export const VARIANCES = (params) => {
  const { variance_application_status_code = [], ...otherParams } = params;
  const formattedCodes =
    variance_application_status_code.length >= 1
      ? { variance_application_status_code: variance_application_status_code.join(",") }
      : {};
  return params
    ? `/variances?${queryString.stringify({
        ...formattedCodes,
        ...otherParams,
      })}`
    : "/variances";
};
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

export const INCIDENT_FOLLOWUP_ACTIONS = `/incidents/followup-types`;
export const INCIDENT_DETERMINATION_TYPES = `/incidents/determination-types`;
export const INCIDENT_STATUS_CODES = `/incidents/status-codes`;
export const INCIDENT_DOCUMENT_TYPE = `/incidents/document-types`;

// report
export const MINE_REPORT_DEFINITIONS = () => `/mines/reports/definitions`;
export const MINE_REPORTS = (mine_guid) => `/mines/${mine_guid}/reports`;
export const MINE_REPORT = (mine_guid, mine_report_guid) =>
  `/mines/${mine_guid}/reports/${mine_report_guid}`;
export const MINE_REPORT_DOCUMENT = (mineGuid) => `/mines/${mineGuid}/reports/documents`;

// Notice Of Work
export const NOTICE_OF_WORK_APPLICATIONS = `/now-submissions/applications`;
export const NOTICE_OF_WORK_APPLICATION = (applicationGuid) =>
  `/now-submissions/applications/${applicationGuid}`;
