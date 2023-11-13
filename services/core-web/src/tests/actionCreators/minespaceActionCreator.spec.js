import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createMinespaceUser,
  fetchMinespaceUsers,
  deleteMinespaceUser,
  fetchMinespaceUserMines,
  deleteEMLIContact,
  updateEMLIContact,
  createEMLIContact,
  fetchEMLIContactsByRegion,
  fetchEMLIContacts,
  updateMinespaceUserMines,
} from "@mds/common/redux/actionCreators/minespaceActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@mds/common/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatch = jest.fn();
const requestSpy = jest.spyOn(genericActions, "request");
const successSpy = jest.spyOn(genericActions, "success");
const errorSpy = jest.spyOn(genericActions, "error");
const mockAxios = new MockAdapter(axios);

jest.setTimeout(30000);

beforeEach(() => {
  mockAxios.reset();
  dispatch.mockClear();
  requestSpy.mockClear();
  successSpy.mockClear();
  errorSpy.mockClear();
});

describe("`fetchMinespaceUsers` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.MINESPACE_USER;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMinespaceUsers()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMinespaceUsers()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMinespaceUserMines` action creator", () => {
  const mine_guids = ["5324632q46", "1436124361"];
  const url = ENVIRONMENT.apiUrl + API.MINE_BASIC_INFO_LIST;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, { mine_guids, simple: true }).reply(200, mockResponse);
    return fetchMinespaceUserMines(mine_guids)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMinespaceUserMines(mine_guids)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createMinespaceUser` action creator", () => {
  const mock_email = "Mock@mock.com";
  const mine_guids = ["12345-6789"];
  const url = ENVIRONMENT.apiUrl + API.MINESPACE_USER;
  const mockPayload = { email: mock_email, mine_guids };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createMinespaceUser(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMinespaceUser({})(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteMinespaceUser` action creator", () => {
  const minespaceUserId = "2";
  const url = `${ENVIRONMENT.apiUrl + API.MINESPACE_USER}/${minespaceUserId}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteMinespaceUser(minespaceUserId)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteMinespaceUser("")(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchEMLIContacts` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.EMLI_CONTACTS;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchEMLIContacts()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchEMLIContacts()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchEMLIContactsByRegion` action creator", () => {
  const region = "NE";
  const isMajorMine = true;
  const url = ENVIRONMENT.apiUrl + API.EMLI_CONTACTS_BY_REGION(region, isMajorMine);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchEMLIContactsByRegion(
      region,
      isMajorMine
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchEMLIContactsByRegion(
      region,
      isMajorMine
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteEMLIContact` action creator", () => {
  const guid = "2";
  const url = ENVIRONMENT.apiUrl + API.EMLI_CONTACT(guid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteEMLIContact(guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteEMLIContact(guid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createEMLIContact` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.EMLI_CONTACTS;
  const payload = { email: "mock_email" };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, payload).reply(200, mockResponse);
    return createEMLIContact(payload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createEMLIContact({})(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateEMLIContact` action creator", () => {
  const guid = 2;
  const url = ENVIRONMENT.apiUrl + API.EMLI_CONTACT(guid);
  const payload = { email: "mock_email" };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updateEMLIContact(
      guid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateEMLIContact(
      guid,
      {}
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMinespaceUserMines` action creator", () => {
  const minespace_id = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl + API.UPDATE_MINESPACE_USER(minespace_id)}`;
  const mockPayLoad = {};
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockMineResponse);
    return updateMinespaceUserMines(
      minespace_id,
      mockPayLoad
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMinespaceUserMines(minespace_id)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
