import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createParty,
  fetchParties,
  fetchPartyById,
  downloadMineManagerHistory,
} from "@/actionCreators/partiesActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as API from "@/constants/API";
import * as MOCK from "../mocks/dataMocks";
import { ENVIRONMENT } from "@/constants/environment";

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

describe("`createParty` action creator", () => {
  const mockPayload = {
    first_name: "mockName",
    party_name: "mockSurname",
  };
  const url = ENVIRONMENT.apiUrl + API.PARTY;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createParty(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createParty(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchParties` action creator", () => {
  let value = " ";
  let url = ENVIRONMENT.apiUrl + API.PARTIES_LIST_QUERY(value);
  it("Request successful if passed an empty query, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(200, mockResponse);
    return fetchParties(value)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request successful if passed a search query, dispatches `success` with correct response", () => {
    value = "?search=mockName";
    url = ENVIRONMENT.apiUrl + API.PARTIES_LIST_QUERY(value);
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(200, mockResponse);
    return fetchParties(value)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(400, MOCK.ERROR);
    return fetchParties(value)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchPartyById` action creator", () => {
  const mockPayload = MOCK.PARTY.partyIds[0];
  const url = `${ENVIRONMENT.apiUrl + API.PARTY}/${mockPayload}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, mockPayload).reply(200, mockResponse);
    return fetchPartyById(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(400, MOCK.ERROR);
    return fetchPartyById(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`downloadMineManagerHistory` action creator", () => {
  const mockMineNo = MOCK.MINES.mineIds[0];
  const url = `${ENVIRONMENT.apiUrl + API.MINE_MANAGER_HISTORY(mockMineNo)}`;
  const mockWindow = { URL: { createObjectURL: () => {} } };
  const mockDocument = {
    createElement: () => ({ setAttribute: () => {}, click: () => {} }),
    body: { appendChild: () => {} },
  };
  const externalMocks = {
    window: mockWindow,
    document: mockDocument,
  };
  it("Request successful, returns response", () => {
    const mockResponse = { success: true, response: { status: 200 } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return downloadMineManagerHistory(mockMineNo, externalMocks).then((response) => {
      expect(response.data).toEqual(mockResponse);
    });
  });

  it("Request failure, returns undefined", () => {
    mockAxios.onGet(url).reply(400, { response: { status: 400 } });
    return downloadMineManagerHistory(mockMineNo, externalMocks).then((response) => {
      expect(response).toBeUndefined();
    });
  });
});
