import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import * as genericActions from "@mds/common/redux/actions/genericActions";
import { ENVIRONMENT } from "@mds/common";
import * as COMMON_API from "@common/constants/API";
import * as API from "@/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import {
  exportNoticeOfWorkApplicationDocument,
  fetchExplosivesPermitDocumentContextTemplate,
} from "@/actionCreators/documentActionCreator";

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

describe("`documentActionCreator` action creator: exported Notice of Work ", () => {
  const documentTypeCode = "NTR";
  const payload = {
    now_application_guid: NOW_MOCK.NOTICE_OF_WORK.application_guid,
    template_data: {},
  };

  const url = `${ENVIRONMENT.apiUrl}${COMMON_API.NOW_APPLICATION_EXPORT_DOCUMENT_TYPE_OPTIONS}/${documentTypeCode}`;
  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url, payload).reply(200, {
      data: { token: "token" },
    });
    return exportNoticeOfWorkApplicationDocument(
      documentTypeCode,
      payload
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(2);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return exportNoticeOfWorkApplicationDocument(
      null,
      null
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchExplosivesPermitDocumentContextTemplate` action creator", () => {
  const documentTypeCode = "LET";
  const explosives_permit_guid = "12345-6789";
  const url =
    ENVIRONMENT.apiUrl +
    API.GET_EXPLOSIVES_PERMIT_DOCUMENT_CONTEXT_TEMPLATE(documentTypeCode, explosives_permit_guid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchExplosivesPermitDocumentContextTemplate(
      documentTypeCode,
      explosives_permit_guid
    )(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchExplosivesPermitDocumentContextTemplate(
      documentTypeCode,
      explosives_permit_guid
    )(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
