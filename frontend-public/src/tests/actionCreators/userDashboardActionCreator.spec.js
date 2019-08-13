import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  fetchMineRecordById,
  fetchUserMineInfo,
  removeMineDocumentFromExpectedDocument,
  addDocumentToExpectedDocument,
  updateExpectedDocument,
  fetchMineDocuments,
} from "@/actionCreators/userDashboardActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as API from "@/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
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

describe("`fetchMineRecordById` action creator", () => {
  const mineId = "2";
  const url = `${ENVIRONMENT.apiUrl + API.MINE}/${mineId}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineRecordById(mineId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineRecordById(mineId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateExpectedDocument` action creator", () => {
  const expDocGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/${expDocGuid}`;

  it("Updates document successfully.", () => {
    const payload = { received_date: "2019-12-12" };
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updateExpectedDocument(expDocGuid, payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    const payload = {};
    mockAxios.onPut(url, payload).reply(400, MOCK.ERROR);
    return updateExpectedDocument(expDocGuid, payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchUserMineInfo` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.USER_MINE_INFO;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchUserMineInfo()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchUserMineInfo()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeMineDocumentFromExpectedDocument` action creator", () => {
  const expectedDocumentGuid = "12345-6789";
  const mineDocumentGuid = "12345-6789-1028";
  const url = `${ENVIRONMENT.apiUrl +
    API.REMOVE_MINE_EXPECTED_DOCUMENT(expectedDocumentGuid, mineDocumentGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeMineDocumentFromExpectedDocument(mineDocumentGuid, expectedDocumentGuid)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(400, MOCK.ERROR);
    return removeMineDocumentFromExpectedDocument(mineDocumentGuid, expectedDocumentGuid)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`addDocumentToExpectedDocument` action creator", () => {
  const expDocGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.UPLOAD_MINE_EXPECTED_DOCUMENT_FILE(expDocGuid);

  it("Request with new upload, dispatches `success` with correct response", () => {
    const payload = { filename: "a file", document_manager_guid: "a GUID" };
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return addDocumentToExpectedDocument(expDocGuid, payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request with existing mine document, dispatches `success` with correct response", () => {
    const payload = { mine_document_guid: "555-6789" };
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return addDocumentToExpectedDocument(expDocGuid, payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    const payload = {};
    mockAxios.onPut(url, payload).reply(400, MOCK.ERROR);
    return addDocumentToExpectedDocument(expDocGuid, payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineDocuments` action creator", () => {
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS(mineGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineDocuments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineDocuments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
