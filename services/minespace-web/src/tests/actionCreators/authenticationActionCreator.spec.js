import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  getUserInfoFromToken,
  authenticateUser,
  unAuthenticateUser,
} from "@/actionCreators/authenticationActionCreator";
import * as genericActions from "@/actions/genericActions";

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
  const token = "2434";
  it("Request successful, dispatches `success` with correct response", () => {
    getUserInfoFromToken(token)(dispatch);
    expect(requestSpy).toHaveBeenCalledTimes(1);
    expect(successSpy).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledTimes(4);
  });
});

describe("`authenticateUser` action creator", () => {
  const accessToken = "abc123";
  it("Request successful, dispatches `success` with correct response", () => {
    authenticateUser(accessToken)(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(2);
  });
});

describe("`unAuthenticateUser` action creator", () => {
  it("dispatches `authenticationActions.logoutUser()`", () => {
    unAuthenticateUser()(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});
