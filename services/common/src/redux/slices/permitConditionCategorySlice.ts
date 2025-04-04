import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER } from "@mds/common/constants/API";
import { IPermitConditionCategory, IPermitConditionReviewAssignment, ItemMap } from "@mds/common/interfaces";
import { notification } from "antd";
import { createSelector } from "@reduxjs/toolkit";
import { getUser } from "./userSlice";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;
export const searchConditionCategoriesType = "searchConditionCategories";
interface ConditionCategoryState {
  condition_categories: IPermitConditionCategory[];
  review_assignments: ItemMap<IPermitConditionReviewAssignment[]>;
  review_assignments_loading: boolean;
}

const initialState: ConditionCategoryState = {
  condition_categories: [],
  review_assignments: {},
  review_assignments_loading: false,
}
const searchConditionCategoriesSlice = createAppSlice({
  name: searchConditionCategoriesType,
  initialState: initialState,
  selectors: {
    getConditionCategories: (state: ConditionCategoryState) => state.condition_categories,
    getReviewAssignments: (state: ConditionCategoryState) => state.review_assignments,
    getReviewAssignmentsLoading: (state: ConditionCategoryState) => state.review_assignments_loading,
  },
  reducers: (create) => ({
    fetchReviewAssignments: create.asyncThunk(
      async (params: { permit_amendment_id: number }, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "Error loading condition review assignments",
        }).get(
          `${ENVIRONMENT.apiUrl}/${PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER(params)}`,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: ConditionCategoryState, action) => {
          const { permit_amendment_id } = action.meta.arg;
          state.review_assignments[permit_amendment_id.toString()] = action.payload.records;
        },
        pending: (state: ConditionCategoryState) => {
          state.review_assignments_loading = true;
        },
        settled: (state: ConditionCategoryState) => {
          state.review_assignments_loading = false;
        },
        rejected: (_: ConditionCategoryState, action) => {
          rejectHandler(action);
        }
      }
    ),
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
        rejected: (_: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
    assignReviewer: create.asyncThunk(
      async (
        payload: {
          assigned_review_user: string,
          condition_category_code: string,
          permit_amendment_id: number,
          description: string,
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}/${PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER()}`,
          payload,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        pending: (state: ConditionCategoryState) => {
          state.review_assignments_loading = true;
        },
        settled: (state: ConditionCategoryState) => {
          state.review_assignments_loading = false;
        },
        fulfilled: (_: ConditionCategoryState, action) => {
          notification.success({
            message: `Successfully assigned ${action.payload.assigned_review_user.display_name} to review ${action.meta.arg.description}`,
            duration: 10,
          });
        },
        rejected: (_: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
    unassignReviewer: create.asyncThunk(
      async (
        payload: {
          condition_review_assignment_guid: string,
          permit_amendment_id: number,
          description: string
        },
        thunkApi
      ) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
          successToastMessage: `Successfully unassigned user from ${payload.description}`
        }).put(
          `${ENVIRONMENT.apiUrl}/${PERMIT_AMENDMENT_CONDITION_ASSIGN_REVIEWER()}`,
          payload,
          headers
        );

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        pending: (state: ConditionCategoryState) => {
          state.review_assignments_loading = true;
        },
        settled: (state: ConditionCategoryState) => {
          state.review_assignments_loading = false;
        },
        fulfilled: (state: ConditionCategoryState, action) => {
          const { permit_amendment_id, condition_review_assignment_guid } = action.meta.arg;
          const reviewAssignments = state.review_assignments[permit_amendment_id.toString()] ?? [];
          const newReviewAssignments = reviewAssignments.filter((assignment) => assignment.condition_review_assignment_guid !== condition_review_assignment_guid);
          state.review_assignments[permit_amendment_id.toString()] = newReviewAssignments;
        },
        rejected: (_: ConditionCategoryState, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
});

export const { getConditionCategories, getReviewAssignments, getReviewAssignmentsLoading } = searchConditionCategoriesSlice.selectors;

export const getReviewAssignmentsByAmendment = (permitAmendmentId: number) => createSelector(
  [getReviewAssignments], (assignments) => {
    return assignments[permitAmendmentId.toString()] ?? [];
  }
);

export const getPermitReviewAssignmentsIsLoaded = (permitAmendmentId: number) => createSelector(
  [getReviewAssignments, getReviewAssignmentsLoading], (allAssignments, loading) => {
    const amendmentAssignments = allAssignments[permitAmendmentId.toString()];
    return !loading && Boolean(amendmentAssignments)
  }
);

export const getCategoryReviewAssignment = (permitAmendmentId: number, condition_category_code: string) => createSelector(
  [getReviewAssignmentsByAmendment(permitAmendmentId)], assignments => {
    const matching = assignments.filter((assignment: IPermitConditionReviewAssignment) => assignment.condition_category_code === condition_category_code);
    return matching?.[0];
  }
);

export const getUserReviewAssignmentsByAmendment = (permitAmendmentId: number) => createSelector(
  [getReviewAssignmentsByAmendment(permitAmendmentId), getUser], (assignments, currentUser) => {
    if (!currentUser?.sub) { return []; }
    return assignments.filter((assignment) => assignment.assigned_review_user.sub === currentUser.sub);
  }
);

export const isUserAssignedToReviewCategory = (permitAmendmentId: number, condition_category_code: string) => createSelector(
  [getCategoryReviewAssignment(permitAmendmentId, condition_category_code), getUser], (assignment, currentUser) => {
    return currentUser?.sub && currentUser.sub === assignment?.assigned_review_user?.sub;
  }
);

export const { searchConditionCategories, assignReviewer, fetchReviewAssignments, unassignReviewer } = searchConditionCategoriesSlice.actions;
export const searchConditionCategoriesReducer = searchConditionCategoriesSlice.reducer;
export default searchConditionCategoriesReducer;
