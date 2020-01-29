import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createPermit,
  fetchPermits,
  updatePermit,
  createPermitAmendment,
  updatePermitAmendment,
  removePermitAmendmentDocument,
} from "@common/actionCreators/permitActionCreator";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";
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

describe("`createPermit` action creator", () => {
  const permit_no = "MX-12315";
  const mine_guid = "12345-6789";
  const permit_status_code = "O";
  const url = ENVIRONMENT.apiUrl + API.PERMITS(mine_guid);
  const mockPayload = { permit_no, permit_status_code };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermit(mine_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPermit(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchPermits` action creator", () => {
  const mine_guid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.PERMITS(mine_guid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchPermits(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchPermits(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermit` action creator", () => {
  const mine_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMITS(mine_guid)}/${permit_guid}`;

  const permit_status_code = "C";
  const description = "test description";

  const mockPayload = { permit_status_code, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermit(mine_guid, permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updatePermit(mine_guid, permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createPermitAmendment` action creator", () => {
  const mine_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTS(mine_guid, permit_guid)}`;

  const issue_date = "2001-01-01";
  const mockPayload = { issue_date };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createPermitAmendment(mine_guid, permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createPermitAmendment(mine_guid, permit_guid, mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updatePermitAmendment` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "123432";
  const permitAmdendmentGuid = "12345-6789";
  const issue_date = "2001-01-01";
  const description = "Test description";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENT(
    mineGuid,
    permitGuid,
    permitAmdendmentGuid
  )}`;
  const mockPayload = { issue_date, description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updatePermitAmendment(mineGuid, permitGuid, permitAmdendmentGuid, mockPayload)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updatePermitAmendment(mineGuid, permitGuid, permitAmdendmentGuid, mockPayload)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removePermitAmendmentDocument` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "12345-6789";
  const permitAmdendmentGuid = "12345-6789";
  const documentGuid = "98765-4321";

  const url = `${ENVIRONMENT.apiUrl}${API.PERMITAMENDMENTDOCUMENT(
    mineGuid,
    permitGuid,
    permitAmdendmentGuid,
    documentGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removePermitAmendmentDocument(mineGuid, permitGuid, permitAmdendmentGuid, documentGuid)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return removePermitAmendmentDocument(mineGuid, permitGuid, permitAmdendmentGuid, documentGuid)(
      dispatch
    ).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
