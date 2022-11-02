import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createProjectSummary,
  fetchProjectSummaryById,
  fetchProjectSummariesByMine,
  updateProjectSummary,
  deleteProjectSummary,
  removeDocumentFromProjectSummary,
  createInformationRequirementsTable,
  updateInformationRequirementsTableByFile,
  updateInformationRequirementsTable,
  removeDocumentFromInformationRequirementsTable,
  fetchRequirements,
  createMajorMineApplication,
  updateMajorMineApplication,
  removeDocumentFromMajorMineApplication,
} from "@common/actionCreators/projectActionCreator";
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

describe("`createProjectSummary` action creator", () => {
  const mineGuid = "12345-6789";
  const args = { mineGuid };
  const submission_date = "2021-11-19T00:00:00.000Z";
  const message = "Successfully created the project description.";
  const project_summary_description = "This is a sample description.";
  const url = ENVIRONMENT.apiUrl + API.NEW_PROJECT_SUMMARY(null);
  const mockPayload = { submission_date, project_summary_description, mine_guid: mineGuid };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createProjectSummary(
      args,
      mockPayload,
      message
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createProjectSummary(
      args,
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
  const url = ENVIRONMENT.apiUrl + API.PROJECT_PROJECT_SUMMARIES(null, { mine_guid: mineGuid });
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
  const projectGuid = "98745-2351";
  const message = "Successfully updated the project description.";
  const url = ENVIRONMENT.apiUrl + API.PROJECT_SUMMARY(projectGuid, projectSummaryGuid);
  const submission_date = "2021-11-20";
  const project_summary_description = "Updated description.";
  const mockPayload = { submission_date, project_summary_description, mine_guid: mineGuid };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateProjectSummary(
      { projectGuid, projectSummaryGuid },
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

describe("`createInformationRequirementsTable` action creator", () => {
  const projectGuid = "12345-6789";
  const documentGuid = "09908034-1234";
  const file = new Blob();
  const url = ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLES(projectGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return createInformationRequirementsTable(
      projectGuid,
      file,
      documentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createInformationRequirementsTable(
      projectGuid,
      null,
      documentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateInformationRequirementsTableByFile` action creator", () => {
  const projectGuid = "12345-6789";
  const informationRequirementsTableGuid = "12345-6789";
  const documentGuid = "98745-2351";
  const file = new Blob();
  const url =
    ENVIRONMENT.apiUrl +
    API.INFORMATION_REQUIREMENTS_TABLE(projectGuid, informationRequirementsTableGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url).reply(200, mockResponse);
    return updateInformationRequirementsTableByFile(
      projectGuid,
      informationRequirementsTableGuid,
      file,
      documentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateInformationRequirementsTableByFile(
      projectGuid,
      informationRequirementsTableGuid,
      null,
      null
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateInformationRequirementsTable` action creator", () => {
  const projectGuid = "12345-6789";
  const informationRequirementsTableGuid = "12345-6789";
  const mockPayload = {
    status_code: "REC",
    documents: [],
  };
  const url =
    ENVIRONMENT.apiUrl +
    API.INFORMATION_REQUIREMENTS_TABLE(projectGuid, informationRequirementsTableGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateInformationRequirementsTable(
      { projectGuid, informationRequirementsTableGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateInformationRequirementsTable(
      { projectGuid },
      {}
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchRequirements` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.REQUIREMENTS;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchRequirements()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchRequirements()(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeDocumentFromInformationRequirementsTable` action creator", () => {
  const mineGuid = "1234567";
  const irtGuid = "23448594";
  const mineDocumentGuid = "123o5981437";
  const url =
    ENVIRONMENT.apiUrl +
    API.INFORMATION_REQUIREMENTS_TABLE_DOCUMENT(mineGuid, irtGuid, mineDocumentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeDocumentFromInformationRequirementsTable(
      mineGuid,
      irtGuid,
      mineDocumentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return removeDocumentFromInformationRequirementsTable(
      mineGuid,
      irtGuid,
      mineDocumentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createMajorMineApplication` action creator", () => {
  const projectGuid = "12345-6789";
  const url = ENVIRONMENT.apiUrl + API.MAJOR_MINE_APPLICATIONS(projectGuid);
  const mockPayload = { status_code: "REC", documents: [] };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createMajorMineApplication(
      { projectGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createMajorMineApplication(
      { projectGuid },
      null
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateMajorMineApplication` action creator", () => {
  const projectGuid = "12345-6789";
  const majorMineApplicationGuid = "12345-6789";
  const mockPayload = {
    status_code: "APV",
    documents: [],
  };
  const url =
    ENVIRONMENT.apiUrl + API.MAJOR_MINE_APPLICATION(projectGuid, majorMineApplicationGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return updateMajorMineApplication(
      { projectGuid, majorMineApplicationGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return updateMajorMineApplication(
      { projectGuid, majorMineApplicationGuid },
      null
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeDocumentFromMajorMineApplication` action creator", () => {
  const mineGuid = "1234567";
  const majorMineApplicationGuid = "23448594";
  const mineDocumentGuid = "123o5981437";
  const url =
    ENVIRONMENT.apiUrl +
    API.MAJOR_MINE_APPLICATION_DOCUMENT(mineGuid, majorMineApplicationGuid, mineDocumentGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return removeDocumentFromMajorMineApplication(
      mineGuid,
      majorMineApplicationGuid,
      mineDocumentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return removeDocumentFromMajorMineApplication(
      mineGuid,
      majorMineApplicationGuid,
      mineDocumentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
