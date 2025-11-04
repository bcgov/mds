import { configureStore } from "@reduxjs/toolkit";
import mineReportStatsReducer, {
    fetchMineReportStats,
    getMineReportStatsByMineGuid,
    getOverdueReportsCountByMineGuid,
    mineReportStatsReducerType,
    storeMineReportStats,
    type MineReportStats,
} from "./mineReportStatsSlice";
import server from "@mds/common/tests/server";
import { http, HttpResponse } from "msw";

const showLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest
    .fn()
    .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("react-redux-loading-bar", () => ({
    showLoading: () => showLoadingMock,
    hideLoading: () => hideLoadingMock,
}));

describe("mineReportStatsSlice", () => {
    const mineGuid = "00000000-0000-0000-0000-000000000000";
    const stats: MineReportStats = {
        active_permits: 2,
        overdue_reports: 5,
        due_next_90_days: 7,
    };

    let store: ReturnType<typeof configureStore>;

    beforeEach(() => {
        store = configureStore({
            reducer: { [mineReportStatsReducerType]: mineReportStatsReducer },
        });
        jest.clearAllMocks();
    });

    it("storeMineReportStats stores stats and selectors read them", () => {
        store.dispatch(storeMineReportStats({ mineGuid, stats }));
        const sliceState = store.getState()[mineReportStatsReducerType];

        expect(getMineReportStatsByMineGuid(mineGuid)({ [mineReportStatsReducerType]: sliceState } as any)).toEqual(stats);
        expect(getOverdueReportsCountByMineGuid(mineGuid)({ [mineReportStatsReducerType]: sliceState } as any)).toEqual(stats.overdue_reports);
    });

    it("getOverdueReportsCountByMineGuid returns 0 when missing", () => {
        const sliceState = store.getState()[mineReportStatsReducerType];
        expect(getOverdueReportsCountByMineGuid("missing-guid")({ [mineReportStatsReducerType]: sliceState } as any)).toEqual(0);
    });

    it("fetchMineReportStats fetches and stores stats, toggles loading bar", async () => {
        server.use(
            http.get("/%3CAPI_URL%3E/mines/:mineGuid/reports/stats", async ({ params }) => {
                expect(params.mineGuid).toBe(mineGuid);
                return HttpResponse.json(stats);
            })
        );

        await store.dispatch<any>(fetchMineReportStats(mineGuid));

        expect(showLoadingMock).toHaveBeenCalledTimes(1);
        expect(hideLoadingMock).toHaveBeenCalledTimes(1);

        const sliceState = store.getState()[mineReportStatsReducerType];
        expect(getMineReportStatsByMineGuid(mineGuid)({ [mineReportStatsReducerType]: sliceState } as any)).toEqual(stats);
        expect(getOverdueReportsCountByMineGuid(mineGuid)({ [mineReportStatsReducerType]: sliceState } as any)).toEqual(stats.overdue_reports);
    });
});
