import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as activityActions from "../actions/activityActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchCoreActivities = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_CORE_ACTIVITIES));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_ACTIVITIES(payload.publishedSince), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_CORE_ACTIVITIES));
      dispatch(activityActions.storeCoreActivities(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_CORE_ACTIVITIES)));
};

export const fetchUserCoreActivities = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_CORE_ACTIVITIES));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_ACTIVITIES(payload.publishedSince), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_CORE_ACTIVITIES));
      dispatch(activityActions.storeUserCoreActivities(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_USER_CORE_ACTIVITIES)));
};

export const GET_CORE_ACTIVITIES = "GET_CORE_ACTIVITIES";
export const GET_USER_CORE_ACTIVITES = "GET_USER_CORE_ACTIVITIES";
