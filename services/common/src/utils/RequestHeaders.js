/**
 * Utility class for various request Headers.
 */

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const createRequestHeader = (customHeaders = {}) => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
    ...customHeaders,
  },
});
