import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import * as genericActions from "@common/actions/genericActions";
import { ENVIRONMENT } from "@common/constants/environment";
import * as COMMON_API from "@common/constants/API";
import * as API from "@/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import * as NOW_MOCK from "@/tests/mocks/noticeOfWorkMocks";
import { exportNoticeOfWorkApplicationDocument } from "@/actionCreators/documentActionCreator";

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
    const mockResponse = { data: { token: "token" } };
    mockAxios.onPost(url, payload).reply(200, mockResponse);
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
