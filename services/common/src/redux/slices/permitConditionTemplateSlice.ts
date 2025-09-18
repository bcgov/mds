import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { PERMIT_CONDITION_INSERT_TEMPLATE } from "@mds/common/constants/API";
import CustomAxios from "../customAxios";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { notification } from "antd";

export const permitConditionTemplateReducerType = "permitConditionTemplateSlice";

const permitConditionTemplateSlice = createAppSlice({
  name: permitConditionTemplateReducerType,
  initialState: {},
  reducers: (create) => ({
    postTemplateConditionToAmendment: create.asyncThunk(
      async (
        params: { permitAmendmentGuid: string; standardPermitConditionGuid: string },
        thunkAPI
      ) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());
        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}${PERMIT_CONDITION_INSERT_TEMPLATE(params.permitAmendmentGuid, params.standardPermitConditionGuid)}`,
          {},
          headers
        );
        thunkAPI.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: () => {
          notification.success({
            message: "Successfully inserted template condition.",
            duration: 5,
          });
        },
        rejected: (state, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
});

export const { postTemplateConditionToAmendment } = permitConditionTemplateSlice.actions;

export default permitConditionTemplateSlice.reducer;
