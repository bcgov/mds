import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import {
    ICreateTailingsStorageFacility,
    ItemMap,
    ITailingsStorageFacility
} from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";

export const tsfReducerType = "TAILINGS";

interface TailingsState {
    mineTsfs: ItemMap<ITailingsStorageFacility[]>;
}

const initialState: TailingsState = {
    mineTsfs: {}
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

// helper function to update a specific tsf in the state
const updateTsfInState = (state: TailingsState, updatedTsf: ITailingsStorageFacility) => {
    const mineGuid = updatedTsf.mine_guid;

    if (!state.mineTsfs[mineGuid]) {
        state.mineTsfs[mineGuid] = [updatedTsf];
    } else {
        state.mineTsfs[mineGuid] = [
            updatedTsf,
            ...state.mineTsfs[mineGuid].filter((item) => item.mine_tailings_storage_facility_guid !== updatedTsf.mine_tailings_storage_facility_guid)
        ]
    }
};
const tsfSlice = createAppSlice({
    name: tsfReducerType,
    initialState,
    reducers: (create) => ({
        storeTsf: create.reducer((state, action: { payload: ITailingsStorageFacility }) => {
            const tsf = action.payload;
            updateTsfInState(state, tsf);
        }),
        createTailingsStorageFacility: create.asyncThunk(
            async (payload: ICreateTailingsStorageFacility, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                let resp;
                try {
                    resp = await CustomAxios({
                        successToastMessage: "Successfully created new Tailings Storage Facility",
                    }).post(`${ENVIRONMENT.apiUrl}${API.MINE_TSFS(payload.mine_guid)}`, payload, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp;
            },
            {
                fulfilled: (state: TailingsState, action) => {
                    const newTsf = action.payload;
                    const mineGuid = newTsf.mine_guid;
                    if (!state.mineTsfs[mineGuid]) {
                        state.mineTsfs[mineGuid] = [newTsf];
                    } else {
                        state.mineTsfs[mineGuid] = [
                            newTsf,
                            ...state.mineTsfs[mineGuid].filter((item) => item.mine_tailings_storage_facility_guid !== newTsf.mine_tailings_storage_facility_guid)
                        ];
                    }
                },
                rejected: (state: TailingsState, action) => {
                    rejectHandler(action);
                }
            }
        ),
        updateTailingsStorageFacility: create.asyncThunk(
            async (payload: Partial<ITailingsStorageFacility>, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                let resp;
                try {
                    resp = await CustomAxios().put(
                        `${ENVIRONMENT.apiUrl}${API.MINE_TSF(payload.mine_guid, payload.mine_tailings_storage_facility_guid)}`, payload, headers
                    );
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data;
            },
            {
                fulfilled: (state: TailingsState, action) => {
                    const updatedTsf = action.payload;
                    updateTsfInState(state, updatedTsf);
                },
                rejected: (state: TailingsState, action) => {
                    rejectHandler(action);
                }
            }
        ),
        fetchTsfsByMineGuid: create.asyncThunk(
            async (mineGuid: string, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                let resp;
                try {
                    resp = await CustomAxios({
                        errorToastMessage: "Failed to load tailings storage facilities",
                    }).get(`${ENVIRONMENT.apiUrl}${API.MINE_TSFS(mineGuid)}`, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data.mine_tailings_storage_facilities;

            }, {
            fulfilled: (state: TailingsState, action) => {
                const mineGuid = action.meta.arg;
                state.mineTsfs[mineGuid] = action.payload;
            }
        }),
        fetchTailingsStorageFacility: create.asyncThunk(
            async (payload: { mineGuid: string, tsfGuid: string }, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                let resp;
                try {
                    resp = await CustomAxios({
                        errorToastMessage: "Failed to load tailings storage facility history",
                    }).get(`${ENVIRONMENT.apiUrl}${API.MINE_TSF(payload.mineGuid, payload.tsfGuid)}`, headers);
                } finally {
                    thunkApi.dispatch(hideLoading());
                }
                return resp.data;
            }, {
            fulfilled: (state: TailingsState, action) => {
                const updatedTsf = action.payload;
                updateTsfInState(state, updatedTsf);
            }
        }),
    }),
    selectors: {
        getTsfs: (state: TailingsState) => {
            return state.mineTsfs;
        }
    }
});

const {
    getTsfs
} = tsfSlice.selectors;

export const getTsfsByMineGuid = (mineGuid: string) =>
    createSelector([getTsfs], (tsfList) => {
        if (!tsfList) return null;
        const tsfs = tsfList[mineGuid];
        return tsfs;
    });

export const getTsfByGuid = (mineGuid: string, tsfGuid: string) =>
    createSelector([getTsfsByMineGuid(mineGuid)], (tsfList) => {
        if (!tsfList) return null;
        const tsf = tsfList.find((tsf) => tsf.mine_tailings_storage_facility_guid === tsfGuid);
        return tsf;
    });


export const {
    storeTsf,
    createTailingsStorageFacility,
    updateTailingsStorageFacility,
    fetchTailingsStorageFacility,
    fetchTsfsByMineGuid } = tsfSlice.actions;

const tailingsReducer = tsfSlice.reducer;
export default tailingsReducer;