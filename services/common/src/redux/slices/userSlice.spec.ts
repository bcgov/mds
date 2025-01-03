import { userReducer, fetchUser, searchUsers, getUser, getSearchUsers } from "./userSlice"; // Adjust the path as required
import { ENVIRONMENT, USER_PROFILE, USER_SEARCH } from "@mds/common/constants";
import CustomAxios from "@mds/common/redux/customAxios";
import { configureStore } from "@reduxjs/toolkit";

const showLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "SHOW_LOADING", payload: { show: true } });
const hideLoadingMock = jest
  .fn()
  .mockReturnValue({ type: "HIDE_LOADING", payload: { show: false } });

jest.mock("@mds/common/redux/customAxios");
jest.mock("react-redux-loading-bar", () => ({
  showLoading: () => showLoadingMock,
  hideLoading: () => hideLoadingMock,
}));

describe("userSlice", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        user: userReducer,
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchUser", () => {
    const mockResponse = {
      data: {
        sub: "mock-sub",
        display_name: "Mock User",
        email: "mock@example.com",
        family_name: "MockFamily",
        given_name: "MockGiven",
        last_logged_in: "2023-10-01T12:00:00.000Z",
      },
    };

    it("should fetch user data successfully", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockResponse),
      }));

      await store.dispatch(fetchUser());
      const state = store.getState().user;

      // Verify loading state management
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      // Verify state update
      expect(getUser({ user: state })).toEqual(mockResponse.data);
      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockRejectedValue(error),
      }));

      await store.dispatch(fetchUser());
      const state = store.getState().user;

      // Check user state remains null on error
      expect(getUser({ user: state })).toBeNull();
    });

    it("should construct the correct endpoint URL", async () => {
      const getMock = jest.fn().mockResolvedValue(mockResponse);
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: getMock,
      }));

      await store.dispatch(fetchUser());

      expect(getMock).toHaveBeenCalledWith(
        `${ENVIRONMENT.apiUrl}${USER_PROFILE()}`,
        expect.any(Object)
      );
    });
  });

  describe("searchUsers", () => {
    const mockSearchResponse = {
      data: [
        {
          sub: "user1-sub",
          display_name: "User One",
          email: "user1@example.com",
          given_name: "User1Given",
          family_name: "User1Family",
        },
        {
          sub: "user2-sub",
          display_name: "User Two",
          email: "user2@example.com",
          given_name: "User2Given",
          family_name: "User2Family",
        },
      ],
    };

    it("should fetch users successfully for a search term", async () => {
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockResolvedValue(mockSearchResponse),
      }));

      const searchTerm = "test-search";

      await store.dispatch(searchUsers(searchTerm));
      const state = store.getState().user;

      // Verify loading state management
      expect(showLoadingMock).toHaveBeenCalledTimes(1);
      expect(hideLoadingMock).toHaveBeenCalledTimes(1);

      // Verify state update
      expect(getSearchUsers({ user: state })).toEqual(mockSearchResponse.data);
      expect(CustomAxios).toHaveBeenCalledWith({ errorToastMessage: "default" });
    });

    it("should handle API error for searchUsers", async () => {
      const error = new Error("API Error");
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: jest.fn().mockRejectedValue(error),
      }));

      const searchTerm = "test-failure";

      await store.dispatch(searchUsers(searchTerm));
      const state = store.getState().user;

      // Check searchUsers state remains empty on error
      expect(getSearchUsers({ user: state })).toEqual([]);
    });

    it("should construct the correct searchUsers endpoint URL", async () => {
      const getMock = jest.fn().mockResolvedValue(mockSearchResponse);
      (CustomAxios as jest.Mock).mockImplementation(() => ({
        get: getMock,
      }));

      const searchTerm = "specific-user";

      await store.dispatch(searchUsers(searchTerm));

      expect(getMock).toHaveBeenCalledWith(
        `${ENVIRONMENT.apiUrl}${USER_SEARCH(searchTerm)}`,
        expect.any(Object)
      );
    });
  });
});
