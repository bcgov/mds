import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { IMineReportPermitRequirement } from "@mds/common/interfaces";
import { MINE_REPORT_PERMIT_REQUIREMENT, STANDARD_REPORT_PERMIT_REQUIREMENT } from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { createSelector } from "@reduxjs/toolkit";
import { getStandardPermitConditions, getSubConditionIds } from "../selectors/permitSelectors";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const mineReportPermitRequirementReducerType = "mineReportPermitRequirement";

interface IMineReportPermitRequirementState {
  standardReportRequirements: IMineReportPermitRequirement[];
}

const initialState: IMineReportPermitRequirementState = {
  standardReportRequirements: undefined
};

const mineReportPermitRequirementSlice = createAppSlice({
  name: mineReportPermitRequirementReducerType,
  initialState,
  reducers: (create) => ({
    fetchStandardReportRequirements: create.asyncThunk(
      async (_, thunkApi) => {

        const headers = createRequestHeader();

        thunkApi.dispatch(showLoading());
        const response = await CustomAxios({
          errorToastMessage: "Error fetching standard report requirements"
        }).get(`${ENVIRONMENT.apiUrl}${STANDARD_REPORT_PERMIT_REQUIREMENT}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      }, {
      fulfilled: (state, action) => {
        state.standardReportRequirements = action.payload.records;
      }
    }
    ),
    createMineReportPermitRequirement: create.asyncThunk(
      async (
        payload: {
          mineGuid?: string;
          values: IMineReportPermitRequirement;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const url = payload.mineGuid
          ? `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(payload.mineGuid)}`
          : `${ENVIRONMENT.apiUrl}${STANDARD_REPORT_PERMIT_REQUIREMENT}`;

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          url,
          payload.values,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      }, {
      fulfilled: (state, action) => {
        if (!action.meta.arg.mineGuid) {
          const newRequirement = action.payload;
          state.standardReportRequirements = [...state.standardReportRequirements, newRequirement];
        }
      }
    }
    ),
    deleteMineReportPermitRequirement: create.asyncThunk(
      async (
        payload: {
          mineGuid?: string;
          mine_report_permit_requirement_id: number;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessage: "default",
          successToastMessage: "Successfully deleted report requirement",
        };
        const { mineGuid, mine_report_permit_requirement_id } = payload;
        const url = mineGuid
          ? `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(mineGuid)}`
          : `${ENVIRONMENT.apiUrl}${STANDARD_REPORT_PERMIT_REQUIREMENT}`;

        const response = await CustomAxios(messages).delete(
          `${url}?mine_report_permit_requirement_id=${mine_report_permit_requirement_id}`,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { mineGuid, mine_report_permit_requirement_id } = action.meta.arg;
          if (!mineGuid) {
            state.standardReportRequirements = state.standardReportRequirements.filter((r) =>
              r.mine_report_permit_requirement_id !== mine_report_permit_requirement_id);
          }
        }
      }
    ),
    updateMineReportPermitRequirement: create.asyncThunk(
      async (payload: {
        mineGuid?: string;
        values: IMineReportPermitRequirement
      }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessage: "default",
          successToastMessage: "Successfully updated report requirement",
        };

        const { mineGuid, values } = payload;
        const url = mineGuid
          ? `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(mineGuid)}`
          : `${ENVIRONMENT.apiUrl}${STANDARD_REPORT_PERMIT_REQUIREMENT}`;

        const response = await CustomAxios(messages).put(
          url,
          values,
          headers,
        );
        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state, action) => {
          const { mineGuid, values } = action.meta.arg;
          const newRequirement = action.payload;
          if (!mineGuid) {
            state.standardReportRequirements = state.standardReportRequirements.map((r) =>
              r.mine_report_permit_requirement_id === values.mine_report_permit_requirement_id
                ? newRequirement
                : r
            );
          }
        }
      }
    )
  }),
  selectors: {
    getStandardReportRequirements: (state: IMineReportPermitRequirementState) => state.standardReportRequirements
  }
});

export const getStandardReportByCondition = (conditionId: number) =>
  createSelector([getStandardReportRequirements, getStandardPermitConditions], (requirements, conditions) => {
    if (!conditionId || !requirements || !(conditions?.length > 0)) {
      return [];
    }

    const condition = conditions.find((c) => c.permit_condition_id === conditionId);
    if (!condition) {
      return [];
    }
    const allConditionIds = getSubConditionIds([condition]);
    const reqByCondition = requirements.filter((r) => r.permit_condition_ids.some((id) => allConditionIds.includes(id)));
    return reqByCondition;
  });

export const { getStandardReportRequirements } = mineReportPermitRequirementSlice.selectors;
export const { createMineReportPermitRequirement, deleteMineReportPermitRequirement, fetchStandardReportRequirements, updateMineReportPermitRequirement } = mineReportPermitRequirementSlice.actions;
export const mineReportPermitRequirementReducer = mineReportPermitRequirementSlice.reducer;
export default mineReportPermitRequirementReducer;
