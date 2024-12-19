import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT, PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER } from "@mds/common/constants";
import { IPermitConditionCategory } from "@mds/common/interfaces";
import { notification } from "antd";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const searchConditionCategoriesType = "searchConditionCategories";
interface ConditionCategoryState {
  condition_categories: IPermitConditionCategory[];
}
const searchConditionCategoriesSlice = createAppSlice({
  name: searchConditionCategoriesType,
  initialState: {},
  selectors: {
    getConditionCategories: (state: ConditionCategoryState) => state.condition_categories,
  },
  reducers: (create) => ({
    searchConditionCategories: create.asyncThunk(
      async (
        payload: {
          query?: string;
          exclude?: string[];
          limit?: number;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const params = new URLSearchParams();
        if (payload.query) params.append("query", payload.query);
        if (payload.exclude) payload.exclude.forEach((item) => params.append("exclude", item));
        if (payload.limit) params.append("limit", payload.limit.toString());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(
          `${ENVIRONMENT.apiUrl}/mines/permits/condition-category-codes?${params.toString()}`,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return {
          ...response.data,
          records: response.data.records.map((item) => ({
            ...item,
            description: ["GEC", "HSC", "GOC", "ELC", "RCC"].includes(item.condition_category_code)
              ? item.description.replace("Conditions", "").trim()
              : item.description,
          })),
        };
      },
      {
        fulfilled: (state: ConditionCategoryState, action) => {
          state.condition_categories = action.payload?.records;
        },
        rejected: (state: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
    assignReviewer: create.asyncThunk(
      async (
        payload: {
          assigned_review_user: string;
          condition_category_code: string;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}/${PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER}`,
          payload,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: ConditionCategoryState, action) => {
          notification.success({
            message: `Successfully assigned ${action.payload.assigned_review_user.display_name} to review ${action.payload.description}`,
            duration: 10,
          });
        },
        rejected: (state: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
    unassignReviewer: create.asyncThunk(
      async (
        payload: {
          condition_category_code: string;
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).put(
          `${ENVIRONMENT.apiUrl}/${PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER}`,
          payload,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: ConditionCategoryState, action) => {
          notification.success({
            message: `Successfully unassigned user from ${action.payload.description}`,
            duration: 10,
          });
        },
        rejected: (state: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
});

export const { getConditionCategories } = searchConditionCategoriesSlice.selectors;
export const { searchConditionCategories, assignReviewer, unassignReviewer } = searchConditionCategoriesSlice.actions;
export const searchConditionCategoriesReducer = searchConditionCategoriesSlice.reducer;
export default searchConditionCategoriesReducer;
