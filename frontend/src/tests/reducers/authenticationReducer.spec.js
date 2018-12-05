import authenticationReducer from "@/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeKeycloakData,
  storeUserAccessData,
} from "@/actions/authenticationActions";

describe("authReducer", () => {
  it("receives undefined", () => {
    const expectedValue = {
      isAuthenticated: false,
      userAccessData: [],
      userInfo: {},
      keycloak: {},
    };
    expect(authenticationReducer(undefined, {})).toEqual(expectedValue);
  });

  it("receives AUTHENTICATE_USER", () => {
    const expectedValue = {
      isAuthenticated: true,
      userAccessData: [],
      userInfo: {},
      keycloak: {},
    };
    const result = authenticationReducer(undefined, authenticateUser({}));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_KEYCLOAK_DATA", () => {
    const expectedValue = {
      isAuthenticated: false,
      userAccessData: [],
      userInfo: {},
      keycloak: { test: "test" },
    };
    const result = authenticationReducer(undefined, storeKeycloakData({ test: "test" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_USER_ACCESS_DATA", () => {
    const expectedValue = {
      isAuthenticated: false,
      userAccessData: ["role1", "role2"],
      userInfo: {},
      keycloak: {},
    };
    const result = authenticationReducer(undefined, storeUserAccessData(["role1", "role2"]));
    expect(result).toEqual(expectedValue);
  });

  it("receives LOGOUT", () => {
    const expectedValue = {
      isAuthenticated: false,
      userAccessData: [],
      userInfo: {},
      keycloak: {},
    };
    const result = authenticationReducer(undefined, logoutUser());
    expect(result).toEqual(expectedValue);
  });
});
