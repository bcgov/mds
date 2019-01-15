// Network URL's
export const MINE = "/mines";
export const MINE_LIST = "/mines";
export const MINE_LIST_QUERY = (params) => `/mines${params}`;
export const MINE_BASIC_INFO_LIST = `/mines/basicinfo`;
export const PARTY = "/parties";
export const PARTIES = (search) => (search ? `/parties?search=${search}` : "/parties");
export const MANAGER = "/parties/managers";
export const PARTY_RELATIONSHIP = "/parties/mines";
export const PERMITTEE = "/permits/permittees";
export const MINE_NAME_LIST = (search) =>
  search ? `/mines/names?search=${search}` : "/mines/names";
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
export const MINE_TSF_REQUIRED_DOCUMENTS = "/documents/required?category=MINE_TAILINGS";
export const EXPECTED_DOCUMENT = "/documents/expected";
export const MINE_TENURE_TYPES = "/mines/mine-tenure-type-codes";
export const MINE_TYPES = "/mines/mine-types";
export const MINE_TYPES_DETAILS = "/mines/mine-types/details";
export const DOCUMENT_MANAGER_FILE_GET_URL = "/document-manager";
export const REMOVE_MINE_EXPECTED_DOCUMENT = (expectedDocumentGuid, mineDocumentGuid) =>
  `/documents/expected/${expectedDocumentGuid}/document/${mineDocumentGuid}`;
