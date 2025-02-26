import { KEYCLOAK } from "@mds/common/constants/environment";
import { signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import { SITEMINDER_LOGOUT_REDIRECT_URI } from "@/constants/environment";

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
