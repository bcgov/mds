import {
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
} from "@common/selectors/authenticationSelectors";
import { authenticationReducer } from "@common/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeUserAccessData,
} from "@common/actions/authenticationActions";
import { AUTHENTICATION } from "@common/constants/reducerTypes";

const mockData = {
  userAccessData: ["role1"],
  userInfo: { name: "test" },
};

describe("authSelectors", () => {
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
});
