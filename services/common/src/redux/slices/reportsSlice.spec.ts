import { configureStore } from "@reduxjs/toolkit";
import reportReducer, {
  createMineReport,
  deleteMineReport,
  fetchMineReport,
  fetchMineReports,
  fetchReports,
  fetchUpcomingMineReports,
  reportReducerType,
} from "./reportSlice";
import server from "@mds/common/tests/server";
import { http, HttpResponse } from "msw";
import * as Strings from "@mds/common/constants/strings";
import * as API from "@mds/common/constants/API";

export const showLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
export const hideLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));

jest.mock("antd", () => ({
  notification: {
    success: jest.fn(),
  },
}));

describe("reportSlice", () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    store = configureStore({
      reducer: { [reportReducerType]: reportReducer },
    });
    jest.clearAllMocks();
  });

  describe("fetchMineReports", () => {
    const mineGuid = "11111111-1111-1111-1111-111111111111";
    const reportsType = Strings.MINE_REPORTS_TYPE.codeRequiredReports;

    it("fetches mine reports, updates state, and toggles loading bar", async () => {
      const payload = {
        records: [{ mine_report_guid: "r-1" }],
        current_page: 1,
        items_per_page: 25,
        total: 1,
        total_pages: 1,
      };

      server.use(
        http.get("/%3CAPI_URL%3E/mines/:mineGuid/reports", async ({ params }) => {
          expect(params.mineGuid).toBe(mineGuid);
          return HttpResponse.json(payload);
        })
      );

      await store.dispatch<any>(fetchMineReports({ mineGuid, reportsType, params: {} }));

      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      const state = store.getState()[reportReducerType];
      expect(state.mineReports).toEqual(payload.records);
      expect(state.reportsPageData).toEqual(payload);
    });
  });

  describe("fetchUpcomingMineReports", () => {
    const mineGuid = "22222222-2222-2222-2222-222222222222";

    it("fetches upcoming mine reports and updates state", async () => {
      const payload = {
        records: [{ mine_report_guid: "u-1" }],
        current_page: 1,
        items_per_page: 25,
        total: 1,
        total_pages: 1,
      };

      server.use(
        http.get("/%3CAPI_URL%3E/mines/:mineGuid/reports", async ({ params }) => {
          expect(params.mineGuid).toBe(mineGuid);
          // upcoming=true is passed as query; path-only matcher is sufficient
          return HttpResponse.json(payload);
        })
      );

      await store.dispatch<any>(fetchUpcomingMineReports({ mineGuid, params: {} }));

      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      const state = store.getState()[reportReducerType];
      expect(state.upcomingMineReports).toEqual(payload.records);
      expect(state.upcomingReportsPageData).toEqual(payload);
    });
  });

  describe("fetchReports", () => {
    it("fetches global reports and updates state", async () => {
      const payload = {
        records: [{ report_guid: "g-1" }],
        current_page: 1,
        items_per_page: 25,
        total: 1,
        total_pages: 1,
      };

      server.use(
        http.get("/%3CAPI_URL%3E/mines/reports", async () => {
          return HttpResponse.json(payload);
        })
      );

      await store.dispatch<any>(fetchReports({}));

      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      const state = store.getState()[reportReducerType];
      expect(state.reports).toEqual(payload.records);
      expect(state.reportsPageData).toEqual(payload);
    });
  });

  describe("fetchMineReport", () => {
    const mineGuid = "33333333-3333-3333-3333-333333333333";
    const mineReportGuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

    it("fetches a single mine report and sets mineReportGuid", async () => {
      const payload = { mine_report_guid: mineReportGuid, foo: "bar" };

      server.use(
        http.get("/%3CAPI_URL%3E/mines/:mineGuid/reports/:mineReportGuid", async ({ params }) => {
          expect(params.mineGuid).toBe(mineGuid);
          expect(params.mineReportGuid).toBe(mineReportGuid);
          return HttpResponse.json(payload);
        })
      );

      await store.dispatch<any>(fetchMineReport({ mineGuid, mineReportGuid }));

      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      const state = store.getState()[reportReducerType];
      expect(state.mineReports).toEqual([payload]);
      expect(state.mineReportGuid).toEqual(mineReportGuid);
    });
  });

  describe("createMineReport", () => {
    const mineGuid = "44444444-4444-4444-4444-444444444444";

    it("posts a new mine report, toggles modal loading", async () => {
      const payload = { alpha: 1 };
      const response = { data: { ok: true, id: "new-1" } };

      server.use(
        http.post("/%3CAPI_URL%3E" + API.MINE_REPORTS(mineGuid), async ({ request }) => {
          const body = await request.json();
          expect(body).toEqual(payload);
          return HttpResponse.json(response.data);
        })
      );

      await store.dispatch<any>(createMineReport({ mineGuid, payload }));

      // note: createMineReport uses showLoading("modal")/hideLoading("modal")
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteMineReport", () => {
    const mineGuid = "55555555-5555-5555-5555-555555555555";
    const mineReportGuid = "ffffffff-1111-2222-3333-444444444444";

    it("deletes a mine report and toggles loading", async () => {
      server.use(
        http.delete(
          "/%3CAPI_URL%3E" + API.MINE_REPORT(mineGuid, mineReportGuid),
          async ({ params }) => {
            expect(params.mineGuid).toBe(mineGuid);
            expect(params.mineReportGuid).toBe(mineReportGuid);
            return HttpResponse.json({});
          }
        )
      );

      await store.dispatch<any>(deleteMineReport({ mineGuid, mineReportGuid }));

      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);
    });
  });
});
