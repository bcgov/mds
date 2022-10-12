import * as MOCK from "@/tests/mocks/dataMocks";
import * as genericActions from "@common/actions/genericActions";

import { DAM, DAMS } from "@common/constants/API";
import { createDam, fetchDam } from "@common/actionCreators/damActionCreator";

import { ENVIRONMENT } from "@common/constants/environment";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

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

describe("`create_dam` action creator", () => {
  const url = `${ENVIRONMENT.apiUrl}${DAMS()}`;
  const mockPayload = {
    mine_tailings_storage_facility_guid: "e2629897-053e-4218-9299-479375e47f78",
    dam_name: "MockDam",
    dam_type: "dam",
    latitude: "123",
    longitude: "123",
    operating_status: "operation",
    consequence_classification: "low",
    permitted_dam_crest_elevation: "123",
    current_dam_height: "123",
    current_elevation: "123",
    max_pond_elevation: "123",
    min_freeboard_required: "123",
  };
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onPost(url, mockPayload).reply(200, mockResponse);
    return createDam(mockPayload)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onPost(url).reply(418, MOCK.ERROR);
    return createDam()(dispatch).catch(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});

describe("`fetch_dam_by_dam_guid` action creator", () => {
  const damGuid = "12345-6789";
  const url = `${ENVIRONMENT.apiUrl}${DAM(damGuid)}`;

  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchDam(damGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(5);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchDam(damGuid)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(4);
    });
  });
});
