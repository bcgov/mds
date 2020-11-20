import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  fetchNoticeOfWorkApplications,
  importNoticeOfWorkApplication,
  fetchImportedNoticeOfWorkApplication,
  fetchOriginalNoticeOfWorkApplication,
  updateNoticeOfWorkApplication,
  createNoticeOfWorkApplicationProgress,
  updateNoticeOfWorkApplicationProgress,
  fetchApplicationDelay,
  updateApplicationDelay,
  createApplicationDelay,
  fetchImportNoticeOfWorkSubmissionDocumentsJob,
  deleteNoticeOfWorkApplicationDocument,
} from "@common/actionCreators/noticeOfWorkActionCreator";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import * as API from "@common/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";

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

describe("`fetchNoticeOfWorkApplications` action creator", () => {
  const url = ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_LIST();
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchNoticeOfWorkApplications()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchNoticeOfWorkApplications()(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`importNoticeOfWorkApplication` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const payload = { mine_guid: "14514315", latitude: "", longitude: "" };
  const url = ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_IMPORT(applicationGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return importNoticeOfWorkApplication(
      applicationGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return importNoticeOfWorkApplication(
      applicationGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchImportedNoticeOfWorkApplication` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const url = ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION(applicationGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchImportedNoticeOfWorkApplication(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchImportedNoticeOfWorkApplication(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchOriginalNoticeOfWorkApplication` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const url = `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION(
    applicationGuid
  )}?original=True`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchOriginalNoticeOfWorkApplication(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchOriginalNoticeOfWorkApplication(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateNoticeOfWorkApplication` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const payload = {};
  const url = `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION(applicationGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url).reply(200, mockResponse);
    return updateNoticeOfWorkApplication(
      payload,
      applicationGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return updateNoticeOfWorkApplication(
      payload,
      applicationGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createNoticeOfWorkApplicationProgress` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const progressCode = "REV";
  const message = "Successful Action";
  const url =
    ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_PROGRESS(applicationGuid, progressCode);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return createNoticeOfWorkApplicationProgress(
      applicationGuid,
      progressCode,
      message
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return createNoticeOfWorkApplicationProgress(
      applicationGuid,
      progressCode,
      message
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateNoticeOfWorkApplicationProgress` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const progressCode = "REV";
  const message = "Successful Action";
  const payload = { end_date: "2020-11-12T00:00:00.000Z" };
  const url =
    ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_PROGRESS(applicationGuid, progressCode);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updateNoticeOfWorkApplicationProgress(
      applicationGuid,
      progressCode,
      payload,
      message
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return updateNoticeOfWorkApplicationProgress(
      applicationGuid,
      progressCode,
      payload,
      message
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateApplicationDelay` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const delayGuid = "51523";
  const payload = { end_date: "2020-11-12T00:00:00.000Z", end_comment: "mock comments" };
  const url = ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_DELAY(applicationGuid, delayGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, payload).reply(200, mockResponse);
    return updateApplicationDelay(
      applicationGuid,
      delayGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return updateApplicationDelay(
      applicationGuid,
      delayGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`createApplicationDelay` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const payload = {
    delay_type_code: "OAB",
    start_comment: "Creating delay",
    start_date: "2020-11-12T00:00:00.000Z",
  };
  const url = `${ENVIRONMENT.apiUrl}${API.NOTICE_OF_WORK_APPLICATION_DELAY(applicationGuid)}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, payload).reply(200, mockResponse);
    return createApplicationDelay(
      applicationGuid,
      payload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return createApplicationDelay(
      applicationGuid,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchApplicationDelay` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const payload = { start_date: new Date() };
  const url = ENVIRONMENT.apiUrl + API.NOTICE_OF_WORK_APPLICATION_DELAY(applicationGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url, payload).reply(200, mockResponse);
    return fetchApplicationDelay(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchApplicationDelay(applicationGuid)(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchImportNoticeOfWorkSubmissionDocumentsJob` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const url = `${ENVIRONMENT.docManUrl}${API.IMPORT_NOTICE_OF_WORK_SUBMISSION_DOCUMENTS_JOB(
    applicationGuid
  )}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchImportNoticeOfWorkSubmissionDocumentsJob(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchImportNoticeOfWorkSubmissionDocumentsJob(applicationGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`deleteNoticeOfWorkApplicationDocument` action creator", () => {
  const applicationGuid = NOW_MOCK.NOTICE_OF_WORK.application_guid;
  const mineDocumentGuid = NOW_MOCK.NOTICE_OF_WORK.documents[0].mine_document_guid;
  const url = `${ENVIRONMENT.apiUrl +
    API.NOTICE_OF_WORK_DOCUMENT(applicationGuid)}/${mineDocumentGuid}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onDelete(url).reply(200, mockResponse);
    return deleteNoticeOfWorkApplicationDocument(
      applicationGuid,
      mineDocumentGuid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onDelete(url).reply(418, MOCK.ERROR);
    return deleteNoticeOfWorkApplicationDocument(
      applicationGuid,
      mineDocumentGuid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
