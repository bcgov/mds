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
  //    WIP
  // it("Request failure, dispatches `error` with correct response", () => {
  //   mockAxios.onPost(url).reply(400, MOCK.ERROR);
  //   return createVariance()(dispatch).then(() => {
  //     expect(requestSpy).toHaveBeenCalledTimes(1);
  //     expect(errorSpy).toHaveBeenCalledTimes(1);
  //     expect(dispatch).toHaveBeenCalledTimes(4);
  //   });
  // });
});

describe("`fetchVariancesByMine` action creator", () => {
  const mineGuid = "1234567";
  const url = ENVIRONMENT.apiUrl + API.VARIANCE(mineGuid);
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
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
