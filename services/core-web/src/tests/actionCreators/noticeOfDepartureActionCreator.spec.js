import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
  createNoticeOfDeparture,
  fetchNoticesOfDeparture,
  addDocumentToNoticeOfDeparture,
  fetchDetailedNoticeOfDeparture,
  updateNoticeOfDeparture,
  removeFileFromDocumentManager,
} from "@mds/common/redux/actionCreators/noticeOfDepartureActionCreator";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as MOCK from "@/tests/mocks/dataMocks";
import {
  NOTICE_OF_DEPARTURE,
  NOTICES_OF_DEPARTURE_DOCUMENTS,
  NOTICES_OF_DEPARTURE,
  NOTICES_OF_DEPARTURE_DOCUMENT,
} from "../../../common/constants/API";

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

describe("`createNoticeOfDeparture` action creator", () => {
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE(mineGuid)}`;
  const mockPayload = {
    permit_guid: "12345-6789",
    nod_title: "doing some new things",
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createNoticeOfDeparture(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createNoticeOfDeparture()(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchNoticesOfDeparture` action creator", () => {
  const mineGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE(mineGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchNoticesOfDeparture(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchNoticesOfDeparture(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchDetailedNoticeOfDeparture` action creator", () => {
  const mineGuid = "12345-6789";
  const nodGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(mineGuid, nodGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchDetailedNoticeOfDeparture(nodGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchDetailedNoticeOfDeparture(nodGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`uploadDocumentsToNoticeOfDeparture` action creator", () => {
  const mineGuid = "12345-6789";
  const noticeOfDepartureGuid = "12345-6789";
  const mockPayload = {
    document_manager_guid: "12345-6789",
    document_name: "test_doc.pdf",
    document_type: "checklist",
  };
  const url = `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE_DOCUMENTS(
    mineGuid,
    noticeOfDepartureGuid
  )}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPut(url, mockPayload).reply(200, mockResponse);
    return addDocumentToNoticeOfDeparture(
      { mineGuid, noticeOfDepartureGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPut(url).reply(418, MOCK.ERROR);
    return addDocumentToNoticeOfDeparture(
      { mineGuid, noticeOfDepartureGuid },
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`updateNoticeOfDeparture` action creator", () => {
  const mineGuid = "12345-6789";
  const nodGuid = "12345-6789";
  const mockPayload = {
    nod_title: "Updated Title",
  };
  const url = `${ENVIRONMENT.apiUrl}${NOTICE_OF_DEPARTURE(mineGuid, nodGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPatch(url, mockPayload).reply(200, mockResponse);
    return updateNoticeOfDeparture(
      { mineGuid, nodGuid },
      mockPayload
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPatch(url).reply(418, MOCK.ERROR);
    return updateNoticeOfDeparture(
      { mineGuid, nodGuid },
      mockPayload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`removeFileFromDocumentManager` action creator", () => {
  const mineGuid = "12345-6789";
  const nodGuid = "12345-6789";
  const docGuid = "12345-6789";

  const url = `${ENVIRONMENT.apiUrl}${NOTICES_OF_DEPARTURE_DOCUMENT(mineGuid, nodGuid, docGuid)}`;

  it("Request successful, returns 200 error", () => {
    mockAxios.onDelete(url).reply(200);
    return removeFileFromDocumentManager({
      mine_guid: mineGuid,
      nod_guid: nodGuid,
      document_manager_guid: docGuid,
    }).then((response) => {
      expect(response.status).toEqual(200);
    });
  });
});
