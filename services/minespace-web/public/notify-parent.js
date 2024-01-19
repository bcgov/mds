// This script is used to notify the parent window of the current URL and is used
// by Keycloak in Minespace to seamlessly check if the user is logged in.
parent.postMessage(location.href, location.origin);
