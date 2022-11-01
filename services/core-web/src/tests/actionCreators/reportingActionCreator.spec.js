import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import * as genericActions from "@common/actions/genericActions";
import { fetchMetabaseDashboard } from "@common/actionCreators/reportingActionCreator";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@common/constants/API";
import * as MOCK from "@/tests/mocks/dataMocks";

const dispatch = jest.fn();
const mockAxios = new MockAdapter(axios);
const errorSpy = jest.spyOn(genericActions, "error");

beforeEach(() => {
  mockAxios.reset();
  dispatch.mockClear();
  errorSpy.mockClear();
});

describe("`fetchMetabaseDashboard` action creator", () => {
  const dashboardId = "12";
  const url = `${ENVIRONMENT.apiUrl}${API.DASHBOARD(dashboardId)}`;
  it("Request failure, dispatches `error` with correct response", () => {
    mockAxios.onGet(url, MOCK.createMockHeader()).reply(418, MOCK.ERROR);
    return fetchMetabaseDashboard(dashboardId).then(() => {
      expect(errorSpy).toHaveBeenCalledTimes(1);
    });
  });
});
