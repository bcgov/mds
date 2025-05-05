import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { IMineReportPermitRequirement } from "@mds/common/interfaces";
import { MINE_REPORT_PERMIT_REQUIREMENT } from "@mds/common/constants/API";
import { ENVIRONMENT } from "@mds/common/constants/environment";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const mineReportPermitRequirementReducerType = "mineReportPermitRequirement";

interface IMineReportPermitRequirementState { }

const initialState: IMineReportPermitRequirementState = {};

const mineReportPermitRequirementSlice = createAppSlice({
  name: mineReportPermitRequirementReducerType,
  initialState,
  reducers: (create) => ({
    createMineReportPermitRequirement: create.asyncThunk(
      async (
        payload: {
          mineGuid: string;
          values: IMineReportPermitRequirement;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const formatPayload = {
          ...payload.values,
          permit_condition_ids: [payload.values.permit_condition_id]
        };

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(payload.mineGuid)}`,
          formatPayload,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      }
    ),
    deleteMineReportPermitRequirement: create.asyncThunk(
      async (
        payload: {
          mineGuid: string;
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
        const response = await CustomAxios(messages).delete(
          `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(mineGuid)}?mine_report_permit_requirement_id=${mine_report_permit_requirement_id}`,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
    ),
    updateMineReportPermitRequirement: create.asyncThunk(
      async (payload: {
        mineGuid: string;
        values: IMineReportPermitRequirement
      }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());
        const messages = {
          errorToastMessage: "default",
          successToastMessage: "Successfully updated report requirement",
        };

        const { mineGuid, values } = payload;
        const response = await CustomAxios(messages).put(
          `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(mineGuid)}`,
          values,
          headers,
        );
        thunkApi.dispatch(hideLoading());
        return response.data;
      },
    )
  }),
});

export const { createMineReportPermitRequirement, deleteMineReportPermitRequirement, updateMineReportPermitRequirement } = mineReportPermitRequirementSlice.actions;
export const mineReportPermitRequirementReducer = mineReportPermitRequirementSlice.reducer;
export default mineReportPermitRequirementReducer;
