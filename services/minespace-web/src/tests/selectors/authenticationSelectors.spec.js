import {
  isAuthenticated,
  getUserInfo,
  getRedirect,
} from "@mds/common/redux/selectors/authenticationSelectors";
import authenticationReducer from "@/reducers/authenticationReducer";
import { authenticateUser, logoutUser } from "@/actions/authenticationActions";
import { AUTHENTICATION } from "@/constants/reducerTypes";
import * as route from "@/constants/routes";

const mockData = {
  isAuthenticated: true,
  userInfo: { name: "test" },
  redirectLogin: route.MINES.route,
  redirectLogout: route.HOME.route,
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
});
