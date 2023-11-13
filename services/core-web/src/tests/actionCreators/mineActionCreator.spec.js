import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createMineRecord,
  updateMineRecord,
  fetchMineRecords,
  fetchMineRecordById,
  fetchMineNameList,
  createTailingsStorageFacility,
  removeMineType,
  fetchMineDocuments,
  fetchSubscribedMinesByUser,
  subscribe,
  unSubscribe,
  fetchMineVerifiedStatuses,
  setMineVerifiedStatus,
  fetchMineComments,
  createMineComment,
  deleteMineComment,
  updateTailingsStorageFacility,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@mds/common/constants/API";
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

describe("`createMineRecord` action creator", () => {
  const mineName = "mock Mine";
  const mineGuid = "12345-6789";
  const mineTenureTypeCode = "MIN";
  const url = ENVIRONMENT.apiUrl + API.MINE;
  const mineTypeUrl = ENVIRONMENT.apiUrl + API.MINE_TYPES(mineGuid);
  const mockMineTypePayLoad = [{ mine_tenure_type_code: mineTenureTypeCode, mine_type_detail: [] }];
  const mockPayLoad = {
    name: mineName,
    mine_tenure_type_code: mineTenureTypeCode,
    mine_guid: mineGuid,
    mine_types: mockMineTypePayLoad,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    const mockMineTypeResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayLoad).reply(200, mockMineResponse);
    mockAxios.onPost(mineTypeUrl, mockMineTypePayLoad).reply(200, mockMineTypeResponse);
    return createMineRecord(mockPayLoad)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMineRecord(mineName)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMineRecord` action creator", () => {
  const mineName = "mock Mine";
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl + API.MINE}/${mineGuid}`;
  const mockPayLoad = {
    name: mineName,
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockMineResponse);
    return updateMineRecord(
      mineGuid,
      mockPayLoad,
      mineName
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMineRecord(mineName)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeMineType` action creator", () => {
  const tenure = "MockTenure";
  const mineGuid = "12345-6789";
  const mineTypeGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_TYPES(mineGuid)}/${mineTypeGuid}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeMineType(
      mineGuid,
      mineTypeGuid,
      tenure
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return removeMineType(mineTypeGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createTailingsStorageFacility` action creator", () => {
  const mine_tailings_storage_facility_name = "MockTSF";
  const mine_guid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_TSFS(mine_guid);
  const mockPayload = { mine_tailings_storage_facility_name };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createTailingsStorageFacility(
      mine_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, mockPayload).reply(418, MOCK.ERROR);
    return createTailingsStorageFacility(
      mine_guid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineRecords` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_LIST_QUERY("1", "5");
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineRecords(
      "1",
      "5"
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineRecords(
      "1",
      "5"
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
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
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineRecordById(mineId)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineNameList` action creator", () => {
  const value = {};
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
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineNameList()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineDocuments` action creator", () => {
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_DOCUMENTS(mineGuid, { is_archived: false })}`;

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
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineDocuments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchSubscribedMinesByUser` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINE_SUBSCRIPTION;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchSubscribedMinesByUser()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchSubscribedMinesByUser()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`unSubscribe` action creator", () => {
  const mineGuid = "12345";
  const mineName = "mockMine";
  const url = ENVIRONMENT.apiUrl + API.SUBSCRIPTION(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return unSubscribe(
      mineGuid,
      mineName
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return unSubscribe(
      mineGuid,
      mineName
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`subscribe` action creator", () => {
  const mineGuid = "12345";
  const mineName = "mockMine";
  const url = ENVIRONMENT.apiUrl + API.SUBSCRIPTION(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return subscribe(
      mineGuid,
      mineName
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return subscribe(
      mineGuid,
      mineName
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineVerifiedStatuses` action creator", () => {
  const user_id = "idir/person1";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_VERIFIED_STATUSES({ user_id })}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineVerifiedStatuses(user_id)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineVerifiedStatuses(user_id)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`setMineVerifiedStatus` action creator", () => {
  const mineName = "mock Mine";
  const mineGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_VERIFIED_STATUS(mineGuid);
  const mockPayLoad = {
    name: mineName,
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockMineResponse);
    return setMineVerifiedStatus(
      mineGuid,
      mockPayLoad
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return setMineVerifiedStatus(
      mineGuid,
      mockPayLoad
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`fetchMineComments` action creator", () => {
  const mineGuid = "346346";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_COMMENTS(mineGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineComments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(3);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineComments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`createMineComment` action creator", () => {
  const mineGuid = "346346";
  const payload = {
    report_comment: "this is my comment",
  };
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_COMMENTS(mineGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, payload).reply(200, mockResponse);
    return createMineComment(
      mineGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return createMineComment(mineGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`deleteMineComment` action creator", () => {
  const mineGuid = "346346";
  const commentGuid = "1451345";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_COMMENT(mineGuid, commentGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteMineComment(
      mineGuid,
      commentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return deleteMineComment(
      mineGuid,
      commentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(2);
    });
  });
});

describe("`updateTailingsStorageFacility` action creator", () => {
  const mine_tailings_storage_facility_name = "MockTSF";
  const mine_guid = "12345-6789";
  const TSFGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_TSF(mine_guid, TSFGuid);
  const mockPayload = { mine_tailings_storage_facility_name };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateTailingsStorageFacility(
      mine_guid,
      TSFGuid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url, mockPayload).reply(418, MOCK.ERROR);
    return updateTailingsStorageFacility(
      mine_guid,
      TSFGuid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
