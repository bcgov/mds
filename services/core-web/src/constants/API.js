import queryString from "query-string";

// Document Generation: Notices of Work
// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const RETRIEVE_CORE_DOCUMENT = (token) => `/documents?${queryString.stringify(token)}`;
