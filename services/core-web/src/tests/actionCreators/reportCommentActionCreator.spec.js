import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  fetchMineReportComments,
  createMineReportComment,
  updateMineReportComment,
  deleteMineReportComment,
} from "@mds/common/redux/actionCreators/reportCommentActionCreator";
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

describe("`fetchMineReportComments` action creator", () => {
  const mineGuid = "1234567";
  const mineReportGuid = "13214";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENTS(mineGuid, mineReportGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineReportComments(
      mineGuid,
      mineReportGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMineReportComments(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteMineReportComment` action creator", () => {
  const mineGuid = "12345-6789";
  const mineReportGuid = "12345-6789";
  const mineReportCommentGuid = "4123513";
  const url = `${ENVIRONMENT.apiUrl}${API.MINE_REPORT_COMMENT(
    mineGuid,
    mineReportGuid,
    mineReportCommentGuid
  )}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteMineReportComment(
      mineGuid,
      mineReportGuid,
      mineReportCommentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteMineReportComment(
      mineGuid,
      mineReportGuid,
      mineReportCommentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMineReportComment` action creator", () => {
  const mineReportGuid = "523456314";
  const mineGuid = "12345-6789";
  const mineReportCommentGuid = "412351235";
  const url = `${ENVIRONMENT.apiUrl +
    API.MINE_REPORT_COMMENT(mineGuid, mineReportGuid, mineReportCommentGuid)}`;
  const mockPayLoad = {
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPut(url, mockPayLoad).reply(200, mockMineResponse);
    return updateMineReportComment(
      mineGuid,
      mineReportGuid,
      mineReportCommentGuid,
      mockPayLoad
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMineReportComment(
      mineGuid,
      mineReportGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createMineReportComment` action creator", () => {
  const mineGuid = "12345-6789";
  const mineReportGuid = "12353451";
  const url = ENVIRONMENT.apiUrl + API.MINE_REPORT_COMMENTS(mineGuid, mineReportGuid);
  const mockPayLoad = {
    mine_guid: mineGuid,
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockMineResponse = { success: true, mine_guid: mineGuid };
    mockAxios.onPost(url, mockPayLoad).reply(200, mockMineResponse);
    return createMineReportComment(
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
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMineReportComment(mineGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
