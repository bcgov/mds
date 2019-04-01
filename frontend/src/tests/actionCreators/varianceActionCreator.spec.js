import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { createVariance, fetchVariancesByMine } from "@/actionCreators/varianceActionCreator";
import * as genericActions from "@/actions/genericActions";
import * as API from "@/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";
import { ENVIRONMENT } from "@/constants/environment";

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

describe("`createVariance` action creator", () => {
  const mineGuid = "1234567";
  const mockPayload = {
    effective_date: "1970-01-01",
    expiry_date: "9999-12-31",
  };
  const url = ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url).reply(200, mockResponse);
    return createVariance(mockPayload, mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(400, MOCK.ERROR);
    return createVariance(mockPayload, mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetchVariancesByMine` action creator", () => {
  const mineGuid = "1234567";
  const varianceId = 1249;
  const url = ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid);
  const documentUrl = ENVIRONMENT.apiUrl + API.VARIANCE_DOCUMENTS(varianceId);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = {
      success: true,
      records: [
        {
          variance_id: 1249,
          compliance_article_id: 1,
          expiry_date: "2019-03-30",
          issue_date: "2019-03-01",
          note: "notesss",
          received_date: "2019-03-01",
        },
      ],
    };
    const mockResponse2 = {
      success: true,
      records: [
        {
          variance_document_xref_guid: "eda300b7-2155-4bf4-9b3d-06b1f4d8a0fe",
          variance_id: 1249,
          mine_document_guid: "d463b9df-7650-4d18-8c73-c8bfb7ae48f0",
          details: {
            mine_document_guid: "d463b9df-7650-4d18-8c73-c8bfb7ae48f0",
            mine_guid: "79edee65-038e-4b26-9048-e41e4c0b7d1a",
            document_manager_guid: "7426b928-caf7-4e1e-aa59-392895929f97",
            document_name: "just_a_pdf.PDF",
            active_ind: "True",
          },
        },
      ],
    };
    mockAxios.onGet(url).reply(200, mockResponse2);
    mockAxios.onGet(documentUrl).reply(200, mockResponse);
    return fetchVariancesByMine(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchVariancesByMine(mineGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
