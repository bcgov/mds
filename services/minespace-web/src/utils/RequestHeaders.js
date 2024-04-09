import keycloak from "@mds/common/keycloak";
/**
 * Utility class for various request Headers.
 */

export const createRequestHeader = () => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: `Bearer ${keycloak.token}`,
  },
});
