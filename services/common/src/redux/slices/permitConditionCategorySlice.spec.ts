import { ENVIRONMENT } from "@mds/common/constants/environment";
import {
  searchConditionCategories,
  searchConditionCategoriesReducer,
  getConditionCategories,
  unassignReviewer,
  assignReviewer,
  fetchReviewAssignments,
  searchConditionCategoriesType,
  getPermitReviewAssignmentsIsLoaded,
  getReviewAssignmentsByAmendment,
  getCategoryReviewAssignment,
  getUserReviewAssignmentsByAmendment,
  isUserAssignedToReviewCategory,
  getReviewAssignments,
} from "./permitConditionCategorySlice";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";
import { notification } from "antd";
import { IPermitConditionReviewAssignment } from "@mds/common/interfaces";
import userReducer, { fetchUser, userReducerType } from "./userSlice";

const showLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });
const notificationSuccessMock = jest.fn();

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));
jest.mock("antd", () => ({
  notification: {
    success: jest.fn(),
  },
}));

describe("permitConditionCategorySlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        searchConditionCategories: searchConditionCategoriesReducer,
        [userReducerType]: userReducer
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchReviewAssignments", () => {
    const permit_amendment_id = 1;
    const records: IPermitConditionReviewAssignment[] = [
      {
        condition_review_assignment_guid: "assignment_guid_1",
        permit_amendment_id,
        condition_category_code: "category_1",
        assigned_review_user: {
          sub: "user_sub_1",
          email: "user@email.com",
          given_name: "First_1",
          family_name: "Last_1",
          display_name: "Last_1, First_1 EMLI:EX",
          last_logged_in: "2025-01-21T17:05:00.646279+00:00"
        }
      },
      {
        condition_review_assignment_guid: "assignment_guid_2",
        permit_amendment_id,
        condition_category_code: "category_2",
        assigned_review_user: {
          sub: "user_sub_2",
          email: "user@email.com",
          given_name: "First_2",
          family_name: "Last_2",
          display_name: "Last_2, First_2 EMLI:EX",
          last_logged_in: "2025-01-21T17:05:00.646279+00:00"
        }
      }
    ]
    const mockResponse = { records };

    it("should fetch condition review assignments successfully", async () => {
      (CustomAxios as jest.Mock).mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
      }));

      const params = { permit_amendment_id };
      await store.dispatch(fetchReviewAssignments(params));

      const state = store.getState();
      const sliceState = state[searchConditionCategoriesType]

      expect(sliceState.review_assignments[permit_amendment_id.toString()]).toEqual(mockResponse.records);
      expect(sliceState.review_assignments_loading).toEqual(false);

      // selectors
      expect(getReviewAssignments(state)).toEqual({ [permit_amendment_id.toString()]: records })
      expect(getReviewAssignmentsByAmendment(permit_amendment_id)(state)).toEqual(records)
      expect(getPermitReviewAssignmentsIsLoaded(permit_amendment_id)(state)).toEqual(true);
      expect(getCategoryReviewAssignment(permit_amendment_id, records[0].condition_category_code)(state)).toEqual(records[0]);

    });

    it("should return correct responses for user selectors", async () => {
      (CustomAxios as jest.Mock).mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
      }));
      const params = { permit_amendment_id };
      await store.dispatch(fetchReviewAssignments(params));

      // populate the user slice
      (CustomAxios as jest.Mock).mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ data: records[0].assigned_review_user }),
      }));
      await store.dispatch(fetchUser());

      let state = store.getState();

      expect(getUserReviewAssignmentsByAmendment(permit_amendment_id)(state)).toEqual([records[0]]);
      expect(isUserAssignedToReviewCategory(permit_amendment_id, records[0].condition_category_code)(state)).toBe(true);
      expect(isUserAssignedToReviewCategory(permit_amendment_id, records[1].condition_category_code)(state)).toBe(false);


      // change to an unassigned user logged in
      (CustomAxios as jest.Mock).mockImplementationOnce(() => ({
        get: jest.fn().mockResolvedValue({ data: { sub: "other_user" } }),
      }));
      await store.dispatch(fetchUser());

      state = store.getState();
      expect(getUserReviewAssignmentsByAmendment(permit_amendment_id)(state)).toEqual([]);

    });

    it("should handle API error", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockRejectedValue(error),
      }));

      await store.dispatch(fetchReviewAssignments({ permit_amendment_id }));
      const state = store.getState();

      expect(getPermitReviewAssignmentsIsLoaded(permit_amendment_id)(state)).toBe(false);
      expect(getReviewAssignmentsByAmendment(permit_amendment_id)(state)).toEqual([]);

    });
  });

  describe("searchConditionCategories", () => {
    const mockResponse = {
      data: {
        records: [
          { code: "TEST1", description: "Test Category 1" },
          { code: "TEST2", description: "Test Category 2" },
        ],
      },
    };

    it("should fetch condition categories successfully", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      const payload = {
        query: "test",
        exclude: ["excluded1"],
        limit: 10,
      };

      await store.dispatch(searchConditionCategories(payload));

      const state = store.getState().searchConditionCategories;

      // Verify loading state management
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      expect(getConditionCategories({ searchConditionCategories: state })).toEqual(
        mockResponse.data.records
      );
      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockRejectedValue(error),
      }));

      await store.dispatch(searchConditionCategories({}));
      const state = store.getState();

      expect(getConditionCategories(state)).toEqual([]);
    });

    it("should construct correct URL with query parameters", async () => {
      const getMock = jest.fn().mockResolvedValue(mockResponse);
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: getMock,
      }));

      const payload = {
        query: "test",
        exclude: ["exc1", "exc2"],
        limit: 5,
      };

      await store.dispatch(searchConditionCategories(payload));

      expect(getMock).toHaveBeenCalledWith(
        expect.stringContaining(`${ENVIRONMENT.apiUrl}/mines/permits/condition-category-codes?`),
        expect.any(Object)
      );
      expect(getMock.mock.calls[0][0]).toContain("query=test");
      expect(getMock.mock.calls[0][0]).toContain("exclude=exc1");
      expect(getMock.mock.calls[0][0]).toContain("exclude=exc2");
      expect(getMock.mock.calls[0][0]).toContain("limit=5");
    });
  });

  describe("assignReviewer", () => {
    const mockResponse = {
      data: {
        assigned_review_user: { display_name: "Test User" },
        description: "Test Condition",
      },
    };

    it("should successfully assign a reviewer", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        post: jest.fn().mockResolvedValue(mockResponse),
      }));

      const payload = {
        permit_amendment_id: 1,
        assigned_review_user: "user1",
        condition_category_code: "code1",
        description: "Test Condition",
      };

      await store.dispatch(assignReviewer(payload));

      // Verify loading state management
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      // Verify success notification
      expect(notification.success).toHaveBeenCalledWith({
        message: `Successfully assigned ${mockResponse.data.assigned_review_user.display_name} to review ${mockResponse.data.description}`,
        duration: 10,
      });


      expect(CustomAxios).toHaveBeenCalledWith({
        errorToastMessage: "default",
        // successToastMessage: `Successfully assigned ${mockResponse.data.assigned_review_user.display_name} to review ${mockResponse.data.description}`
      });
    });

    it("should handle API error when assigning a reviewer", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        post: jest.fn().mockRejectedValue(error),
      }));

      const payload = {
        permit_amendment_id: 1,
        assigned_review_user: "user1",
        condition_category_code: "code1",
        description: "Test Condition"
      };

      await store.dispatch(assignReviewer(payload));

      expect(notificationSuccessMock).not.toHaveBeenCalled();
    });
  });

  describe("unassignReviewer", () => {
    const mockResponse = {
      data: {
        description: "Test Condition",
      },
    };

    it("should successfully unassign a reviewer", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        put: jest.fn().mockResolvedValue(mockResponse),
      }));

      const payload = {
        condition_review_assignment_guid: "guid1",
        permit_amendment_id: 1,
        description: "Test Condition"
      };

      await store.dispatch(unassignReviewer(payload));

      // Verify success notification

      expect(CustomAxios).toHaveBeenCalledWith({
        errorToastMessage: "default",
        successToastMessage: `Successfully unassigned user from ${mockResponse.data.description}`,
      });
    });

    it("should handle API error when unassigning a reviewer", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        put: jest.fn().mockRejectedValue(error),
      }));

      const payload = {
        condition_review_assignment_guid: "guid1",
        permit_amendment_id: 1,
        description: "Test Condition",
      };

      await store.dispatch(unassignReviewer(payload));

      expect(notificationSuccessMock).not.toHaveBeenCalled();
    });
  });
});
