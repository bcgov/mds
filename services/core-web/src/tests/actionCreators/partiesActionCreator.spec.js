import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createParty,
  fetchParties,
  fetchPartyById,
  setAddPartyFormState,
  updateParty,
  deleteParty,
  addDocumentToRelationship,
  createPartyOrgBookEntity,
} from "@common/actionCreators/partiesActionCreator";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";
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
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createParty(mockPayload)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateParty` action creator", () => {
  const mockPayload = {
    first_name: "mockName",
    party_name: "mockSurname",
  };
  const partyGuid = "475837594";
  const url = `${ENVIRONMENT.apiUrl + API.PARTY}/${partyGuid}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateParty(
      mockPayload,
      partyGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateParty(
      mockPayload,
      partyGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("'deleteParties' action creator", () => {
  const partyGuid = "475837594";
  const url = `${ENVIRONMENT.apiUrl + API.PARTY}/${partyGuid}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteParty(partyGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteParty(partyGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchParties` action creator", () => {
  let value = {};
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

  it("Request successful if passed a query param, dispatches `success` with correct response", () => {
    value = { first_name: "mockName" };
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
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
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
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
    return fetchPartyById(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`setAddPartyFormState` action creator", () => {
  const mockAddPartyFormState = MOCK.ADD_PARTY_FORM_STATE;
  it("dispatched storeAddPartyFormState", () => {
    setAddPartyFormState(mockAddPartyFormState)(dispatch);
    expect(dispatch).toHaveBeenCalledTimes(1);
  });
});

describe("`fetchInspectors` action creator", () => {
  const url = `${ENVIRONMENT.apiUrl +
    API.PARTIES_LIST_QUERY({ per_page: "all", business_role: "INS" })}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
  });
  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url).reply(418, MOCK.ERROR);
  });
});

describe("`addDocumentToRelationship` action creator", () => {
  const mineGuid = "1234567";
  const mockPayload = {
    document_manager_guid: "f6737c4f-2cf2-4efb-923a-3e010f8737c5",
    document_name: "test.pdf",
  };
  const minePartyApptGuid = "23448594";
  const url =
    ENVIRONMENT.apiUrl + API.MINE_PARTY_APPOINTMENT_DOCUMENTS(mineGuid, minePartyApptGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url).reply(200, mockResponse);
    return addDocumentToRelationship(
      { mineGuid, minePartyApptGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return addDocumentToRelationship(
      { mineGuid, minePartyApptGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createPartyOrgBookEntity` action creator", () => {
  const partyGuid = "475837594";
  const mockPayload = {
    credential_id: 777855,
  };
  const url = ENVIRONMENT.apiUrl + API.PARTY_ORGBOOK_ENTITY(partyGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(201, mockResponse);
    return createPartyOrgBookEntity(
      partyGuid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPartyOrgBookEntity(
      partyGuid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
