import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import { fetchMineComplianceInfo } from "@/actionCreators/complianceActionCreator";
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

describe("`fetchMineComplianceInfo` action creator", () => {
  const mineNo = "1234567";
  const url = `${ENVIRONMENT.apiUrl + API.MINE_COMPLIANCE_INFO}/${mineNo}`;
  it("Request successful, dispatches `success` with correct response", () => {
    const mockResponse = { data: { success: true } };
    mockAxios.onGet(url).reply(200, mockResponse);
    return fetchMineComplianceInfo(mineNo)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(successSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(6);
    });
  });

  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(400, MOCK.ERROR);
    return fetchMineComplianceInfo(mineNo)(dispatch).then(() => {
      expect(requestSpy).toHaveBeenCalledTimes(1);
      expect(errorSpy).toHaveBeenCalledTimes(1);
      expect(dispatch).toHaveBeenCalledTimes(6);
    });
  });
});
