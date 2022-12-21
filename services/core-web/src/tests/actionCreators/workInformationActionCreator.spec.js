import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createMineWorkInformation,
  updateMineWorkInformation,
  fetchMineWorkInformations,
  deleteMineWorkInformation,
} from "@common/actionCreators/workInformationActionCreator";
import * as genericActions from "@common/actions/genericActions";
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

describe("`createMineWorkInformation` action creator", () => {
  const mineGuid = "bbf2ccfe-9da6-4d88-95df-fe9997d64d96";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`;
  const mockPayload = {
    work_start_date: "2001-01-01",
    work_stop_date: "2002-01-01",
    work_comments: "test",
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createMineWorkInformation(
      mineGuid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMineWorkInformation(mineGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchMineWorkInformations` action creator", () => {
  const mineGuid = "bbf2ccfe-9da6-4d88-95df-fe9997d64d96";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATIONS(mineGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineWorkInformations(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineWorkInformations(mineGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMineWorkInformation` action creator", () => {
  const mineGuid = "bbf2ccfe-9da6-4d88-95df-fe9997d64d96";
  const mineWorkInformationGuid = "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(
    mineGuid,
    mineWorkInformationGuid
  )}`;
  const mockPayload = {
    work_start_date: "2001-01-01",
    work_stop_date: "2002-01-01",
    work_comments: "test",
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateMineWorkInformation(
      mineGuid,
      mineWorkInformationGuid,
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMineWorkInformation(
      mineGuid,
      mineWorkInformationGuid,
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteMineWorkInformation` action creator", () => {
  const mineGuid = "bbf2ccfe-9da6-4d88-95df-fe9997d64d96";
  const mineWorkInformationGuid = "e8ccfdd4-c852-4116-be2c-b2cc7f3148a3";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_WORK_INFORMATION(
    mineGuid,
    mineWorkInformationGuid
  )}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deleteMineWorkInformation(
      mineGuid,
      mineWorkInformationGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteMineWorkInformation(
      mineGuid,
      mineWorkInformationGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
