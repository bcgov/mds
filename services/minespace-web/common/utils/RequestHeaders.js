import keycloak from "@mds/common/keycloak";
/**
 * Utility class for various request Headers.
 */

// This file is anticipated to have multiple exports
export const createRequestHeader = (customHeaders = {}) => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: `Bearer ${keycloak.token}`,
    ...customHeaders,
  },
});
