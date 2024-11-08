import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT, MINE_REPORT_PERMIT_REQUIREMENT } from "@mds/common/constants";
import { IMineReportPermitRequirement } from "@mds/common/interfaces";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const mineReportPermitRequirementReducerType = "mineReportPermitRequirement";

interface IMineReportPermitRequirementState {}

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

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}${MINE_REPORT_PERMIT_REQUIREMENT(payload.mineGuid)}`,
          payload.values,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      }
    ),
  }),
});

export const { createMineReportPermitRequirement } = mineReportPermitRequirementSlice.actions;
export const mineReportPermitRequirementReducer = mineReportPermitRequirementSlice.reducer;
export default mineReportPermitRequirementReducer;
