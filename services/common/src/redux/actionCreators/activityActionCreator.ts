import { hideLoading, showLoading } from "react-redux-loading-bar";
import { success, error, request } from "../actions/genericActions";
import CustomAxios from "../customAxios";
import { storeActivities } from "../actions/activityActions";
import { AxiosResponse } from "axios";
import { IActivity } from "@mds/common/interfaces";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { ACTIVITIES, ACTIVITIES_MARK_AS_READ } from "@mds/common/constants/API";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

export const fetchActivities = (
  user: string,
  page = 1,
  per_page = 20
): AppThunk<Promise<AxiosResponse<IActivity>>> => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_ACTIVITIES));
  dispatch(showLoading());
  const headers = {
    ...createRequestHeader(),
    params: {
      user,
      page,
      per_page,
    },
  };
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${ACTIVITIES()}`, headers)
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_ACTIVITIES));
      dispatch(storeActivities(response.data));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.GET_ACTIVITIES));
    })
    .finally(() => dispatch(hideLoading()));
};

export const markActivitiesAsRead = (activity_guids: string[]): AppThunk => (dispatch) => {
  dispatch(showLoading());
  const headers = {
    ...createRequestHeader(),
  };
  return CustomAxios()
    .patch(`${ENVIRONMENT.apiUrl}${ACTIVITIES_MARK_AS_READ()}`, { activity_guids }, headers)
    .then(() => {
      dispatch(success(NetworkReducerTypes.GET_ACTIVITIES));
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.GET_ACTIVITIES));
    })
    .finally(() => dispatch(hideLoading()));
};
