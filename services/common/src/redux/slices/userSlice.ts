import { createAppSlice, rejectHandler } from "@mds/common/redux/createAppSlice";
import { createRequestHeader } from "@mds/common/redux/utils/RequestHeaders";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT, USER_PROFILE } from "@mds/common/constants";
import { IUser } from "@mds/common/interfaces";

export const userReducerType = "user";

interface UserState {
  user: IUser;
}

const initialState: UserState = {
  user: null,
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
  }),
  selectors: {
    getUser: (state) => state.user,
  },
});

export const { getUser } = userSlice.selectors;
export const { fetchUser } = userSlice.actions;
export const userReducer = userSlice.reducer;

export default userReducer;
