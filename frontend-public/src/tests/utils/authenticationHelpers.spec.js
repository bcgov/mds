import { signOutFromSSO, signOutFromSiteMinder } from "@/utils/authenticationHelpers";
import * as API from "@/constants/API";

describe("`signOutFromSSO` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSSO();
    expect(window.open).toHaveBeenCalledWith(API.SSO_LOGOUT_ENDPOINT, "_self");
  });
});

describe("`signOutFromSiteMinder` function", () => {
  jest.spyOn(window, "open");
  it("opens a new window with given url", () => {
    signOutFromSiteMinder();
    expect(window.open).toHaveBeenCalledWith(API.SITEMINDER_LOGOUT_ENDPOINT, "_self");
  });
});
