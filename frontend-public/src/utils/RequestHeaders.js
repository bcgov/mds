/**
 * Utility class for various request Headers.
 */

export const createRequestHeader = () => ({
  headers: {
    "Access-Control-Allow-Origin": "*",
    Authorization: `Bearer ${localStorage.getItem("jwt")}`,
  },
});
