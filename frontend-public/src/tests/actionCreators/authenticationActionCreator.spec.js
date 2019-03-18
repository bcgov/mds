import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import queryString from "query-string";
import {
  getUserInfoFromToken,
  authenticateUser,
  unAuthenticateUser,
} from "@/actionCreators/authenticationActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as ENV from "@/constants/environment";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatch = jest.fn();
const requestSpy = jest.spyOn(genericActions, "request");
const successSpy = jest.spyOn(genericActions, "success");
const errorSpy = jest.spyOn(genericActions, "error");
const mockAxios = new MockAdapter(axios);

beforeEach(() => {
  mockAxios.reset();
  dispatch.mockClear();
  requestSpy.mockClear();
  successSpy.mockClear();
  errorSpy.mockClear();
});

describe("`getUserInfoFromToken` action creator", () => {
  const url = ENV.KEYCLOAK.userInfoURL;
  const token = "2434";
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return getUserInfoFromToken(token)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return getUserInfoFromToken("A Token", "An Error Message")(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });
});

describe("`authenticateUser` action creator", () => {
  const url = ENV.KEYCLOAK.tokenURL;
  const code = "2434";
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: ENV.BCEID_LOGIN_REDIRECT_URI,
    client_id: ENV.KEYCLOAK.clientId,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, queryString.stringify(data)).reply(200, mockResponse);
    return authenticateUser(code)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return authenticateUser()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });
});

describe("`unAuthenticateUser` action creator", () => {
  it("dispatches `authenticationActions.logoutUser()`", () => {
    unAuthenticateUser()(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
