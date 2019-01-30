import { signOutFromSSO, signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import * as ENV from "@/constants/environment";

describe("`signOutFromSSO` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSSO();
    expect(window.open).toHaveBeenCalledWith(
      `${ENV.KEYCLOAK.keycloakLogoutURL}${ENV.KEYCLOAK_LOGOUT_REDIRECT_URI}`,
      "_self"
    );
  });
});

describe("`signOutFromSiteMinder` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSiteMinder();
    expect(window.open).toHaveBeenCalledWith(
      `${ENV.KEYCLOAK.siteMinderLogoutURL}${ENV.SITEMINDER_LOGOUT_REDIRECT_URI}`,
      "_self"
    );
  });
});
