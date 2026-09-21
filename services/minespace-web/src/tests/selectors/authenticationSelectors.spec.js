import {
  isAuthenticated,
  getUserInfo,
  getRedirect,
  isProponent,
  isNewProponent,
} from "@mds/common/redux/selectors/authenticationSelectors";
import {
  authenticateUser,
  logoutUser,
  storeUserAccessData,
  storeIsProponent,
} from "@/actions/authenticationActions";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as route from "@/constants/routes";
import { authenticationReducer } from "@mds/common/redux/reducers/authenticationReducer";

const mockData = {
  isAuthenticated: true,
  userInfo: { name: "test" },
  redirectLogin: route.MINES.route,
  redirectLogout: route.HOME.route,
  redirectNewUser: route.NEW_USER.route,
};

describe("authSelectors", () => {
  it("`isAuthenticated` calls `authReducer.isAuthenticated`", () => {
    const authAction = authenticateUser(mockData.userInfo);
    const authState = authenticationReducer({}, authAction);
    const mockState = {
      [AUTHENTICATION]: authState,
    };

    expect(isAuthenticated(mockState)).toEqual(true);
  });

  it("`getUserInfo` calls `authReducer.getUserInfo`", () => {
    const userAccessAction = authenticateUser(mockData.userInfo);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(getUserInfo(mockState)).toEqual(mockData.userInfo);
  });

  it("`logoutUser` calls `authReducer.isAuthenticated`", () => {
    const authAction = logoutUser(mockData.userInfo);
    const authState = authenticationReducer({}, authAction);
    const mockState = {
      [AUTHENTICATION]: authState,
    };

    expect(isAuthenticated(mockState)).toEqual(false);
    expect(getUserInfo(mockState)).toEqual({});
  });

  it("`getRedirect` calls `authReducer.getRedirect` after login", () => {
    const userAccessAction = authenticateUser(mockData.userAccessData);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(getRedirect(mockState)).toEqual(mockData.redirectLogin);
  });

  it("`getRedirect` calls `authReducer.getRedirect` after logout", () => {
    const userAccessAction = logoutUser(mockData.userAccessData);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(getRedirect(mockState)).toEqual(mockData.redirectLogout);
  });

  describe("MineSpace-specific: new user signup flow", () => {
    it("redirects to NEW_USER route when no roles (feature enabled by default)", () => {
      // First authenticate
      const authAction = authenticateUser(mockData.userInfo);
      let authState = authenticationReducer({}, authAction);

      // Then store empty roles - should redirect to NEW_USER
      const userAccessAction = storeUserAccessData([]);
      authState = authenticationReducer(authState, userAccessAction);

      const mockState = {
        [AUTHENTICATION]: authState,
      };

      expect(getRedirect(mockState)).toEqual(mockData.redirectNewUser);
    });

    it("redirects to MINES route when user has roles", () => {
      // First authenticate
      const authAction = authenticateUser(mockData.userInfo);
      let authState = authenticationReducer({}, authAction);

      // Then store roles - should keep MINES redirect
      const userAccessAction = storeUserAccessData(["role1"]);
      authState = authenticationReducer(authState, userAccessAction);

      const mockState = {
        [AUTHENTICATION]: authState,
      };

      expect(getRedirect(mockState)).toEqual(mockData.redirectLogin);
    });
  });

  it("`isProponent` calls `authReducer.isProponent`", () => {
    const isProponentAction = storeIsProponent(true);
    const isProponentState = authenticationReducer({}, isProponentAction);
    const mockState = {
      [AUTHENTICATION]: isProponentState,
    };

    expect(isProponent(mockState)).toEqual(true);
  });

  it("`isNewProponent` returns true when user has no roles (new signup)", () => {
    const userAccessAction = storeUserAccessData([]);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(isNewProponent(mockState)).toEqual(true);
  });

  it("`isNewProponent` returns false when user has roles (existing user)", () => {
    const userAccessAction = storeUserAccessData(["proponent_role"]);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(isNewProponent(mockState)).toEqual(false);
  });
});
