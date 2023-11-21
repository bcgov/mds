import {
  isAuthenticated,
  getUserAccessData,
  getUserInfo,
} from "@mds/common/redux/selectors/authenticationSelectors";
import { authenticationReducer } from "@mds/common/redux/reducers/authenticationReducer";
import {
  authenticateUser,
  logoutUser,
  storeUserAccessData,
} from "@mds/common/redux/actions/authenticationActions";
import { AUTHENTICATION } from "@mds/common/constants/reducerTypes";
import * as ROUTES from "../../constants/routes";

const mockData = {
  userAccessData: ["role1"],
  userInfo: { name: "test" },
};

describe("authSelectors", () => {
  beforeEach(() => {
    global.ROUTES = ROUTES;
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
});
