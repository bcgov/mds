import { searchConditionCategories, searchConditionCategoriesReducer, getConditionCategories } from "./permitConditionCategorySlice";
import { ENVIRONMENT } from "@mds/common/constants";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";

const showLoadingMock = jest.fn().mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest.fn().mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));

describe("permitConditionCategorySlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        searchConditionCategories: searchConditionCategoriesReducer,
      }
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
          { code: "TEST2", description: "Test Category 2" }
        ]
      }
    };

    it("should fetch condition categories successfully", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse)
      }));

      const payload = {
        query: "test",
        exclude: ["excluded1"],
        limit: 10
      };

      await store.dispatch(searchConditionCategories(payload));

      const state = store.getState().searchConditionCategories;

      // Verify loading state management
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      expect(getConditionCategories({ searchConditionCategories: state })).toEqual(mockResponse.data.records);
      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockRejectedValue(error)
      }));

      await store.dispatch(searchConditionCategories({}));
      const state = store.getState();

      expect(getConditionCategories(state)).toBeUndefined();
    });

    it("should construct correct URL with query parameters", async () => {
      const getMock = jest.fn().mockResolvedValue(mockResponse);
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: getMock
      }));

      const payload = {
        query: "test",
        exclude: ["exc1", "exc2"],
        limit: 5
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
});