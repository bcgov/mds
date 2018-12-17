import authenticationReducer from "@/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeKeycloakData,
  storeUserAccessData,
} from "@/actions/authenticationActions";

const baseExpectedValue = {
  isAuthenticated: false,
  userAccessData: [],
  userInfo: {},
  keycloak: {},
};

// Creates deep copy of javascript object instead of setting a reference
const getBaseExpectedValue = () => JSON.parse(JSON.stringify(baseExpectedValue));

describe("authReducer", () => {
  it("receives undefined", () => {
    const expectedValue = getBaseExpectedValue();
    expect(authenticationReducer(undefined, {})).toEqual(expectedValue);
  });

  it("receives AUTHENTICATE_USER", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.isAuthenticated = true;
    const result = authenticationReducer(undefined, authenticateUser({}));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_KEYCLOAK_DATA", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.keycloak = { test: "test" };
    const result = authenticationReducer(undefined, storeKeycloakData({ test: "test" }));
    expect(result).toEqual(expectedValue);
  });

  it("receives STORE_USER_ACCESS_DATA", () => {
    const expectedValue = getBaseExpectedValue();
    expectedValue.userAccessData = ["role1", "role2"];
    const result = authenticationReducer(undefined, storeUserAccessData(["role1", "role2"]));
    expect(result).toEqual(expectedValue);
  });

  it("receives LOGOUT", () => {
    const expectedValue = getBaseExpectedValue();
    const result = authenticationReducer(undefined, logoutUser());
    expect(result).toEqual(expectedValue);
  });
});
