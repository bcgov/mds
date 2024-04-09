import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  searchOrgBook,
  fetchOrgBookCredential,
  verifyOrgBookCredential,
} from "@mds/common/redux/actionCreators/orgbookActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@mds/common/constants/API";
import * as MOCK from "../mocks/dataMocks";

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

describe("`searchOrgBook` action creator", () => {
  const search = "foo";
  const url = ENVIRONMENT.apiUrl + API.ORGBOOK_SEARCH(search);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, search).reply(200, mockResponse);
    return searchOrgBook(search)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return searchOrgBook(search)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchOrgBookCredential` action creator", () => {
  const credentialId = 777855;
  const url = ENVIRONMENT.apiUrl + API.ORGBOOK_CREDENTIAL(credentialId);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, credentialId).reply(200, mockResponse);
    return fetchOrgBookCredential(credentialId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return fetchOrgBookCredential(credentialId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`verifyOrgBookCredential` action creator", () => {
  const credentialId = 12345;
  const url = ENVIRONMENT.apiUrl + API.ORGBOOK_VERIFY(credentialId);

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { success: true };
    mockAxios.onGet(url, credentialId).reply(200, mockResponse);
    return verifyOrgBookCredential(credentialId)(dispatch).then((response) => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
      expect(response).toEqual(mockResponse);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return verifyOrgBookCredential(credentialId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
