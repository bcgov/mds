import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { IUser } from "@mds/common/interfaces";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { USER_PROFILE, USER_SEARCH } from "@mds/common/constants/API";

export const userReducerType = "user";

interface UserState {
  user: IUser;
  searchUsers: IUser[];
}

const initialState: UserState = {
  user: null,
  searchUsers: [],
};

const userSlice = createAppSlice({
  name: userReducerType,
  initialState,
  reducers: (create) => ({
    fetchUser: create.asyncThunk(
      async (_: undefined, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${USER_PROFILE()}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: UserState, action) => {
          state.user = action.payload;
        },
        rejected: (state: UserState, action) => {
          rejectHandler(action);
        },
      }
    ),
    searchUsers: create.asyncThunk(
      async (searchTerm: string, thunkApi) => {
        const headers = createRequestHeader();
        thunkApi.dispatch(showLoading());

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${USER_SEARCH(searchTerm)}`, headers);

        thunkApi.dispatch(hideLoading());
        return response.data;
      },
      {
        fulfilled: (state: UserState, action) => {
          state.searchUsers = action.payload;
        },
        rejected: (state: UserState, action) => {
          rejectHandler(action);
        },
      }
    ),
  }),
  selectors: {
    getUser: (state) => state.user,
    getSearchUsers: (state) => state.searchUsers,
  },
});

export const { getUser, getSearchUsers } = userSlice.selectors;
export const { fetchUser, searchUsers } = userSlice.actions;
export const userReducer = userSlice.reducer;

export default userReducer;
