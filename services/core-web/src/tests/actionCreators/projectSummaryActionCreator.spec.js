import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  fetchProjectSummariesByMine,
  updateProjectSummary,
  deleteProjectSummary,
  removeDocumentFromProjectSummary,
} from "@common/actionCreators/projectSummaryActionCreator";
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

describe("`createProjectSummary` action creator", () => {
  const mineGuid = "12345-6789";
  const submission_date = "2021-11-19T00:00:00.000Z";
  let message = "Successfully created the project description.";
  const project_summary_description = "This is a sample description.";
  const url = ENVIRONMENT.apiUrl + API.MINE_PROJECT_SUMMARIES(mineGuid);
  const mockPayload = { submission_date, project_summary_description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createProjectSummary(
      { mineGuid },
      mockPayload,
      (message = "Successfully created a project description.")
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createProjectSummary(
      mineGuid,
      message
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchProjectSummariesByMine` action creator", () => {
  const mineGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MINE_PROJECT_SUMMARIES(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchProjectSummariesByMine({ mineGuid })(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchProjectSummariesByMine({ mineGuid })(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchProjectSummaryById` action creator", () => {
  const mineGuid = "1234567";
  const projectSummaryGuid = "1234567";
  const url = ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchProjectSummaryById(
      mineGuid,
      projectSummaryGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchProjectSummaryById(
      mineGuid,
      projectSummaryGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateProjectSummary` action creator", () => {
  const mineGuid = "12345-6789";
  const projectSummaryGuid = "12345-6789";
  const message = "Successfully updated the project description.";
  const url = ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid);
  const submission_date = "2021-11-20";
  const project_summary_description = "Updated description.";
  const mockPayload = { submission_date, project_summary_description };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateProjectSummary(
      { mineGuid, projectSummaryGuid },
      mockPayload,
      message
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateProjectSummary(
      { mineGuid, projectSummaryGuid },
      mockPayload,
      message
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeDocumentToProjectSummary` action creator", () => {
  const mineGuid = "1234567";
  const projectSummaryGuid = "23448594";
  const mineDocumentGuid = "123o5981437";
  const url =
    ENVIRONMENT.apiUrl +
    API.PROJECT_SUMMARY_DOCUMENT(mineGuid, projectSummaryGuid, mineDocumentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeDocumentFromProjectSummary(
      mineGuid,
      projectSummaryGuid,
      mineDocumentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return removeDocumentFromProjectSummary(
      mineGuid,
      projectSummaryGuid,
      mineDocumentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteProjectSummary` action creator", () => {
  const mineGuid = "12345-6789";
  const projectSummaryGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(mineGuid, projectSummaryGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(204, mockResponse);
    return deleteProjectSummary(
      mineGuid,
      projectSummaryGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return deleteProjectSummary(
      mineGuid,
      projectSummaryGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
