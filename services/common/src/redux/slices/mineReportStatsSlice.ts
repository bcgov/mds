import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import { createSelector } from "@reduxjs/toolkit";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";

export const mineReportStatsReducerType = "MINE_REPORT_STATS";

export interface MineReportStats {
    active_permits: number;
    overdue_reports: number;
    due_next_90_days: number;
}

interface MineReportStatsState {
    byMineGuid: Record<string, MineReportStats | undefined>;
}

const initialState: MineReportStatsState = {
    byMineGuid: {},
};

const mineReportStatsSlice = createAppSlice({
    name: mineReportStatsReducerType,
    initialState,
    reducers: (create) => ({
        storeMineReportStats: create.reducer(
            (state, action: { payload: { mineGuid: string; stats: MineReportStats } }) => {
                const { mineGuid, stats } = action.payload;
                state.byMineGuid[mineGuid] = stats;
            }
        ),
        fetchMineReportStats: create.asyncThunk(
            async (mineGuid: string, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());
                let resp;
                try {
                    resp = await CustomAxios({
                        errorToastMessage: "Failed to load report stats",
                    }).get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_STATS(mineGuid)}`, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return { mineGuid, stats: resp.data as MineReportStats };
            },
            {
                fulfilled: (state: MineReportStatsState, action) => {
                    const { mineGuid, stats } = action.payload as { mineGuid: string; stats: MineReportStats };
                    state.byMineGuid[mineGuid] = stats;
                },
            }
        ),
    }),
    selectors: {
        getMineReportStatsState: (state: MineReportStatsState) => state.byMineGuid,
    },
});

const { getMineReportStatsState } = mineReportStatsSlice.selectors;

export const getMineReportStatsByMineGuid = (mineGuid: string) =>
    createSelector([getMineReportStatsState], (map) => map[mineGuid]);

export const getOverdueReportsCountByMineGuid = (mineGuid: string) =>
    createSelector([getMineReportStatsByMineGuid(mineGuid)], (stats) => stats?.overdue_reports ?? 0);

export const { storeMineReportStats, fetchMineReportStats } = mineReportStatsSlice.actions;

const mineReportStatsReducer = mineReportStatsSlice.reducer;
export default mineReportStatsReducer;
