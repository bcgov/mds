import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  fetchMineReports,
  fetchReports,
  deleteMineReport,
  createMineReport,
  updateMineReport,
} from "@common/actionCreators/reportActionCreator";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@common/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as Strings from "@common/constants/strings";

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

describe("`fetchMineReports` action creator", () => {
  const mineGuid = "1234567";
  const reportsType = Strings.MINE_REPORTS_TYPE.codeRequiredReports;

  const url = `${ENVIRONMENT.apiUrl}${API.MINE_REPORTS(mineGuid, reportsType)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineReports(
      mineGuid,
      reportsType
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineReports(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchReports` action creator", () => {
  const url = `${ENVIRONMENT.apiUrl}${API.REPORTS()}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchReports()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchReports()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteMineReport` action creator", () => {
  const mineGuid = "12345-6789";
  const mineReportGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_REPORT(mineGuid, mineReportGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteMineReport(
      mineGuid,
      mineReportGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteMineReport(
      mineGuid,
      mineReportGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMineReport` action creator", () => {
  const mineReportGuid = "523456314";
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl + API.MINE_REPORT(mineGuid, mineReportGuid)}`;
  const mockPayLoad = {
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockMineResponse);
    return updateMineReport(
      mineGuid,
      mineReportGuid,
      mockPayLoad
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMineReport(
      mineGuid,
      mineReportGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createMineReport` action creator", () => {
  const mineGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_REPORTS(mineGuid);
  const mockPayLoad = {
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPost(url, mockPayLoad).reply(200, mockMineResponse);
    return createMineReport(
      mineGuid,
      mockPayLoad
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMineReport(mineGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
