import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createExplosivesPermit,
  fetchExplosivesPermits,
  updateExplosivesPermit,
  deleteExplosivesPermit,
} from "@mds/common/redux/actionCreators/explosivesPermitActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
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

describe("`createExplosivesPermit` action creator", () => {
  const permit_no = "MX-12315";
  const mine_guid = "12345-6789";
  const permit_status_code = "O";
  const url = ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mine_guid);
  const mockPayload = { permit_no, permit_status_code };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createExplosivesPermit(
      mine_guid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createExplosivesPermit(mine_guid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchExplosivesPermits` action creator", () => {
  const mine_guid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.EXPLOSIVES_PERMITS(mine_guid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchExplosivesPermits(mine_guid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchExplosivesPermits(mine_guid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateExplosivesPermit` action creator", () => {
  const mine_guid = "12345-6789";
  const permit_guid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.EXPLOSIVES_PERMIT(mine_guid, permit_guid)}`;
  const permit_status_code = "C";
  const description = "test description";

  const mockPayload = { permit_status_code, description, generate_documents: true };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateExplosivesPermit(
      mine_guid,
      permit_guid,
      mockPayload,
      true
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateExplosivesPermit(
      mine_guid,
      permit_guid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteExplosivesPermit` action creator", () => {
  const mineGuid = "12345-6789";
  const permitGuid = "123432";

  const url = `${ENVIRONMENT.apiUrl}${API.EXPLOSIVES_PERMIT(mineGuid, permitGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deleteExplosivesPermit(
      mineGuid,
      permitGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return deleteExplosivesPermit(
      mineGuid,
      permitGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
