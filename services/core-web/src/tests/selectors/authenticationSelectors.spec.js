import {
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
  getSystemFlag,
  userHasRole,
  getFormattedUserName,
} from "@mds/common/redux/selectors/authenticationSelectors";
import { authenticationReducer } from "@mds/common/redux/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeUserAccessData,
  storeSystemFlag,
} from "@mds/common/redux/actions/authenticationActions";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import { USER_ROLES } from "@mds/common/constants/environment";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as ROUTES from "../../constants/routes";

const mockData = {
  userAccessData: ["role1"],
  userInfo: { name: "test" },
};

describe("authSelectors", () => {
  beforeEach(() => {
    global.GLOBAL_ROUTES = ROUTES;
  });
  it("`isAuthenticated` calls `authReducer.isAuthenticated`", () => {
    const authAction = authenticateUser(mockData.userInfo);
    const authState = authenticationReducer({}, authAction);
    const mockState = {
      [AUTHENTICATION]: authState,
    };

    expect(isAuthenticated(mockState)).toEqual(true);
    expect(getUserInfo(mockState)).toEqual(mockData.userInfo);
  });

  it("`getUserAccessData` calls `authReducer.getUserAccessData`", () => {
    const userAccessAction = storeUserAccessData(mockData.userAccessData);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(getUserAccessData(mockState)).toEqual(mockData.userAccessData);
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

  it("`getSystemFlag` calls `authReducer.getSystemFlag`", () => {
    const systemFlagAction = storeSystemFlag(SystemFlagEnum.core);
    const systemFlagState = authenticationReducer({}, systemFlagAction);
    const mockState = {
      [AUTHENTICATION]: systemFlagState,
    };

    expect(getSystemFlag(mockState)).toEqual(SystemFlagEnum.core);
  });

  it("`userHasRole` returns true when user has the role", () => {
    const userAccessAction = storeUserAccessData([USER_ROLES.role_admin]);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(userHasRole("role_admin")(mockState)).toEqual(true);
  });

  it("`userHasRole` returns false when user does not have the role", () => {
    const userAccessAction = storeUserAccessData(["other_role"]);
    const userAccessState = authenticationReducer({}, userAccessAction);
    const mockState = {
      [AUTHENTICATION]: userAccessState,
    };

    expect(userHasRole("role_admin")(mockState)).toEqual(false);
  });

  it("`getFormattedUserName` formats IDIR username correctly", () => {
    const authAction = authenticateUser({ preferred_username: "testuser", identity_provider: "idir" });
    const authState = authenticationReducer({}, authAction);
    const mockState = {
      [AUTHENTICATION]: authState,
    };

    expect(getFormattedUserName(mockState)).toEqual("idir\\testuser");
  });
});
