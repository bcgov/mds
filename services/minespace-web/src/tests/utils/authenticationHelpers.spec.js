import { KEYCLOAK } from "@mds/common";
import { signOutFromSSO, signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import {
  KEYCLOAK_LOGOUT_REDIRECT_URI,
  SITEMINDER_LOGOUT_REDIRECT_URI,
} from "@/constants/environment";

describe("`signOutFromSSO` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSSO();
    expect(window.open).toHaveBeenCalledWith(
      `${KEYCLOAK.keycloakLogoutURL}${KEYCLOAK_LOGOUT_REDIRECT_URI}`,
      "_self"
    );
  });
});

describe("`signOutFromSiteMinder` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSiteMinder();
    expect(window.open).toHaveBeenCalledWith(
      `${KEYCLOAK.siteMinderLogoutURL}${SITEMINDER_LOGOUT_REDIRECT_URI}`,
      "_self"
    );
  });
});
