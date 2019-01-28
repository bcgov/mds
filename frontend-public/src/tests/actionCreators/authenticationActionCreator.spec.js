import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import queryString from "query-string";
import {
  getUserInfoFromToken,
  authenticateUser,
  unAuthenticateUser,
} from "@/actionCreators/authenticationActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as API from "@/constants/API";
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
  const url = API.GET_USER_INFO_FROM_SSO;
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
    return getUserInfoFromToken()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`authenticateUser` action creator", () => {
  const url = API.GET_TOKEN_FROM_SSO;
  const code = "2434";
  const data = {
    code,
    grant_type: "authorization_code",
    redirect_uri: API.SSO_LOGIN_REDIRECT_URI,
    client_id: API.SSO_CLIENT_ID,
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
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`unAuthenticateUser` action creator", () => {
  it("dispatches `authenticationActions.logoutUser()`", () => {
    unAuthenticateUser()(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
