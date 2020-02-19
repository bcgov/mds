import queryString from "query-string";

// Document Generation: Notices of Work
export const RETRIEVE_CORE_DOCUMENT = (token_guid) => `/documents?token${token_guid}`;
