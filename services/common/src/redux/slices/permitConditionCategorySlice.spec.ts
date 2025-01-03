import {
  searchConditionCategories,
  searchConditionCategoriesReducer,
  getConditionCategories,
  unassignReviewer,
  assignReviewer,
} from "./permitConditionCategorySlice";
import { ENVIRONMENT } from "@mds/common/constants";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";
import { notification } from "antd";

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
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
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

      expect(getConditionCategories(state)).toBeUndefined();
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
        assigned_review_user: "user1",
        condition_category_code: "code1",
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

      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error when assigning a reviewer", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        post: jest.fn().mockRejectedValue(error),
      }));

      const payload = {
        assigned_review_user: "user1",
        condition_category_code: "code1",
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
        condition_category_code: "code1",
      };

      await store.dispatch(unassignReviewer(payload));

      // Verify success notification
      expect(notification.success).toHaveBeenCalledWith({
        message: `Successfully unassigned user from ${mockResponse.data.description}`,
        duration: 10,
      });

      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error when unassigning a reviewer", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        put: jest.fn().mockRejectedValue(error),
      }));

      const payload = {
        condition_category_code: "code1",
      };

      await store.dispatch(unassignReviewer(payload));

      expect(notificationSuccessMock).not.toHaveBeenCalled();
    });
  });
});
