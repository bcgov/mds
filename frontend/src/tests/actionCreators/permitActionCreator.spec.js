import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createPermit,
  fetchPermits,
  updatePermit,
  createPermitAmendment,
  updatePermitAmendment,
} from "@/actionCreators/permitActionCreator";
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

describe("`createPermit` action creator", () => {
  const permit_no = "MX-12315";
  const mine_guid = "12345-6789";
  const permit_status_code = "O";
  const url = ENVIRONMENT.apiUrl + API.PERMIT();
  const mockPayload = { mine_guid, permit_no, permit_status_code };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermit(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createPermit({})(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchPermits` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.PERMIT({});
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchPermits()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchPermits()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermit` action creator", () => {
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMIT()}/${permit_guid}`;

  const permit_status_code = "C";
  const description = "test description";

  const mockPayload = { permit_status_code, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermit(permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(400, MOCK.ERROR);
    return updatePermit(permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createPermitAmendment` action creator", () => {
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTS(permit_guid)}`;

  const issue_date = "2001-01-01";
  const mockPayload = { issue_date };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermitAmendment(permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createPermitAmendment(permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermitAmendment` action creator", () => {
  const permitAmdendmentGuid = "12345-6789";
  const issue_date = "2001-01-01";
  const description = "Test description";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENT(permitAmdendmentGuid)}`;
  const mockPayload = { issue_date, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermitAmendment(permitAmdendmentGuid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(400, MOCK.ERROR);
    return updatePermitAmendment(permitAmdendmentGuid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
