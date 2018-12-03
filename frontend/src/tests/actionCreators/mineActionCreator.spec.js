import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createMineRecord,
  updateMineRecord,
  fetchMineRecords,
  fetchMineRecordById,
  fetchMineNameList,
  fetchStatusOptions,
  fetchRegionOptions,
  createTailingsStorageFacility,
  createMineExpectedDocument,
  removeExpectedDocument,
  fetchMineTailingsRequiredDocuments,
  fetchMineTenureTypes,
} from '@/actionCreators/mineActionCreator';
import * as genericActions from '@/actions/genericActions';
import * as API from '@/constants/API';
import * as MOCK from '@/tests/mocks/dataMocks';
import { ENVIRONMENT } from '@/constants/environment'

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

describe("`createMineRecord` action creator", () => {
  const mineName = "mock Mine";
  const url = ENVIRONMENT.apiUrl + API.MINE;
  const mockPayLoad = { name: mineName };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayLoad).reply(200, mockResponse);
    return createMineRecord(mockPayLoad)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createMineRecord(mineName)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMineRecord` action creator", () => {
  const mineId = "1";
  const tenureNumber = "0293847";
  const mineName = "MockMine";
  const url = ENVIRONMENT.apiUrl + API.MINE + "/" + mineId;
  const mockPayload = { tenure_number_id: tenureNumber };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateMineRecord(mineId, mockPayload, mineName)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(400, MOCK.ERROR);
    return updateMineRecord(mineId, tenureNumber)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createTailingsStorageFacility` action creator", () => {
  const tsf_name = "MockTSF";
  const mine_guid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_TSF;
  const mockPayload = { tsf_name: tsf_name, mine_guid: mine_guid };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createTailingsStorageFacility(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createTailingsStorageFacility(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`createMineExpectedDocument` action creator', () => {
  const mine_guid = "12345-6789"
  const url = ENVIRONMENT.apiUrl + API.ADD_MINE_EXPECTED_DOCUMENT + "/" + mine_guid;
  const mockPayload = {document_name: 'requiredReportLabel', req_document_guid:'09876-5432'} 
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, {'documents':[mockPayload]}).reply(200, mockResponse);
    return (createMineExpectedDocument(mine_guid,mockPayload)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return (createMineExpectedDocument(mine_guid)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`removeMineExpectedDocument` action creator', () => {
  const exp_doc_guid = "12345-6789"
  const url = ENVIRONMENT.apiUrl + API.REMOVE_EXPECTED_DOCUMENT + "/" + exp_doc_guid; 
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return (removeExpectedDocument(exp_doc_guid)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onDelete(url).reply(400, MOCK.ERROR);
    return (removeExpectedDocument(exp_doc_guid)(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`fetchMineRecords` action creator', () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY('1', '5');
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineRecords("1", "5")(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineRecords("1", "5")(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineRecordById` action creator", () => {
  const mineId = "2";
  const url = ENVIRONMENT.apiUrl + API.MINE + "/" + mineId;
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

describe("`fetchMineNameList` action creator", () => {
  const value = "";
  const url = ENVIRONMENT.apiUrl + API.MINE_NAME_LIST(value);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineNameList()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineNameList()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchStatusOptions` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_STATUS;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchStatusOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchStatusOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchRegionOptions` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_REGION;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchRegionOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchRegionOptions()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe('`fetchMineTailingsRequiredDocuments` action creator', () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_TSF_REQUIRED_DOCUMENTS;
  it('Request successful, dispatches `success` with correct response', () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return (fetchMineTailingsRequiredDocuments()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });
  it('Request failure, dispatches `error` with correct response', () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return (fetchMineTailingsRequiredDocuments()(dispatch)).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineTenureTypes` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_TENURE_TYPES;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineTenureTypes()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineTenureTypes()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
