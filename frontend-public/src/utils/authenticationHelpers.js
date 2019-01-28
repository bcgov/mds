import * as API from "@/constants/API";

export const signOutFromSSO = () => {
  window.open(API.SSO_LOGOUT_ENDPOINT, "_self");
};

export const signOutFromSiteMinder = () => {
  window.open(API.SITEMINDER_LOGOUT_ENDPOINT, "_self");
};
