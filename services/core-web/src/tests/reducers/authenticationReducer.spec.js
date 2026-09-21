import { authenticationReducer } from "@mds/common/redux/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeUserAccessData,
  storeSystemFlag,
  storeIsProponent,
} from "@mds/common/redux/actions/authenticationActions";
import { SystemFlagEnum } from "@mds/common/constants/enums";
import * as ROUTES from "../../constants/routes";

const baseExpectedValue = {
  isAuthenticated: false,
  userAccessData: [],
  userInfo: {},
  isProponent: undefined,
  redirect: false,
  systemFlag: undefined,
};

const baseAuthenticatedExpectedValue = {
  isAuthenticated: true,
  userAccessData: [],
  userInfo: {},
  isProponent: undefined,
  systemFlag: undefined,
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));
const getBaseAuthenticatedExpectedValue = () =>
  JSON.parse(JSON.stringify(baseAuthenticatedExpectedValue));

describe("authReducer", () => {
  beforeEach(() => {
    global.GLOBAL_ROUTES = ROUTES;
  });

  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    expect(authenticationReducer(undefined, {})).toEqual(expectedValue);
  });

  it("receives AUTHENTICATE_USER", () => {
    const expectedValue = getBaseAuthenticatedExpectedValue();
    expectedValue.isAuthenticated = true;
    const result = authenticationReducer(undefined, authenticateUser({}));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_USER_ACCESS_DATA", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.userAccessData = ["role1", "role2"];
    const result = authenticationReducer(undefined, storeUserAccessData(["role1", "role2"]));
    expect(result).toEqual(expectedValue);
  });

  it("receives LOGOUT", () => {
    const expectedValue = getBaseAuthenticatedExpectedValue();
    expectedValue.isAuthenticated = false;
    const result = authenticationReducer(undefined, logoutUser());
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_SYSTEM_FLAG", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.systemFlag = SystemFlagEnum.core;
    const result = authenticationReducer(undefined, storeSystemFlag(SystemFlagEnum.core));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_IS_PROPONENT", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.isProponent = true;
    const result = authenticationReducer(undefined, storeIsProponent(true));
    expect(result).toEqual(expectedValue);
  });
});
