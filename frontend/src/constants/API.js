import queryString from "query-string";

// Network URL's
export const MINE = "/mines";
export const MINE_LIST = "/mines";
export const MINE_LIST_QUERY = (params) => `/mines${params}`;
export const PARTIES_LIST_QUERY = (params = {}) =>
  "type" in params
    ? `/parties/search?${queryString.stringify(params)}`
    : `/parties?${queryString.stringify(params)}`;
export const MINE_BASIC_INFO_LIST = `/mines/basicinfo`;
export const PARTY = "/parties";
export const MANAGER = "/parties/managers";
export const PARTY_RELATIONSHIP = "/parties/mines";
export const PERMITTEE = "/permits/permittees";
export const MINE_NAME_LIST = (params = {}) => `/mines/search?${queryString.stringify(params)}`;
export const MINE_STATUS = "/mines/status";
export const MINE_REGION = "/mines/region";
export const MINE_COMPLIANCE_INFO = "/mines/compliance";
export const MINE_TSF = "/mines/tailings";
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
export const DOCUMENT_MANAGER_FILE_GET_URL = "/document-manager";
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;
export const MINE_MANAGER_HISTORY = (mineNo) =>
  `/parties/mines/manager-history/csv?mine_no=${mineNo}`;
export const MINESPACE_USER = "/users/minespace";
export const PROVINCE_CODES = "/parties/sub-division-codes";

// permits
export const PERMIT = (params) =>
  params ? `/permits?${queryString.stringify(params)}` : "/permits";
export const PERMITAMENDMENTS = (permitGuid) => `${PERMIT()}/${permitGuid}/amendments`;
export const PERMITAMENDMENT = (permitAmendmentGuid) =>
  `${PERMIT()}/amendments/${permitAmendmentGuid}`;
export const PERMITAMENDMENTDOCUMENT = (permitAmendmentGuid, DocumentGuid) =>
  `${PERMITAMENDMENT(permitAmendmentGuid)}/documents/${DocumentGuid}`;
export const PERMITAMENDMENTDOCUMENTS = (permitAmendmentGuid) =>
  `${PERMIT()}/amendments/${permitAmendmentGuid}/documents`;

export const APPLICATIONS = "/applications";
