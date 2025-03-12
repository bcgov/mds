import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import CustomAxios from "@mds/common/redux/customAxios";
import * as API from "@mds/common/constants/API";
import {
    ICreateDam,
    IDam,
    ItemMap,
} from "@mds/common/interfaces";
import { createSelector } from "@reduxjs/toolkit";

export const damReducerType = "DAMS";

interface DamState {
    dams: ItemMap<IDam>;
}

const initialState: DamState = {
    dams: {}
};

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const damSlice = createAppSlice({
    name: damReducerType,
    initialState,
    reducers: (create) => ({
        storeDam: create.reducer((state, action: { payload: IDam }) => {
            const dam = action.payload;
            state.dams[dam.dam_guid] = dam;
        }),
        createDam: create.asyncThunk(
            async (payload: ICreateDam, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                const resp = await CustomAxios({
                    successToastMessage: "Successfully created new Dam",
                }).post(`${ENVIRONMENT.apiUrl}${API.DAMS()}`, payload, headers);

                thunkApi.dispatch(hideLoading());
                return resp;
            },
            {
                fulfilled: (state: DamState, action) => {
                    const newDam = action.payload;
                    state[newDam.dam_guid] = newDam;
                },
                rejected: (state: DamState, action) => {
                    rejectHandler(action);
                }
            }
        ),
        updateDam: create.asyncThunk(
            async (payload: Partial<IDam>, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                const resp = CustomAxios().patch(
                    `${ENVIRONMENT.apiUrl}${API.DAM(payload.dam_guid)}`, payload, headers
                );

                thunkApi.dispatch(hideLoading());
                return resp.data;
            },
            {
                fulfilled: (state: DamState, action) => {
                    const updatedDam = action.payload;
                    state[updatedDam.dam_guid] = updatedDam;
                },
                rejected: (state: DamState, action) => {
                    rejectHandler(action);
                }
            }
        ),
        fetchDamHistory: create.asyncThunk(
            async (damGuid: string, thunkApi) => {
                const headers = createRequestHeader();
                thunkApi.dispatch(showLoading());

                const resp = await CustomAxios({
                    errorToastMessage: "Failed to load dam history",
                }).get(`${ENVIRONMENT.apiUrl}${API.DAM(damGuid)}`, headers);

                thunkApi.dispatch(hideLoading());
                return resp.data;
            }, {
            fulfilled: (state: DamState, action) => {
                const updatedDam = action.payload;
                state.dams[updatedDam.dam_guid] = updatedDam;
            }
        }
        ),
    }),
    selectors: {
        getDams: (state: DamState) => {
            return state.dams;
        }
    },
});

const {
    getDams
} = damSlice.selectors;

export const getDamByGuid = (damGuid: string) =>
    createSelector([getDams], (damData) => {
        return damData[damGuid];
    });
export const { storeDam, createDam, updateDam, fetchDamHistory } = damSlice.actions;

const damReducer = damSlice.reducer;
export default damReducer;