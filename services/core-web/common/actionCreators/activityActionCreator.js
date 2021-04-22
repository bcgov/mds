import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as activityActions from "../actions/activityActions";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { notification } from "antd";

export const fetchCoreActivities = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_CORE_ACTIVITIES));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_ACTIVITIES(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_CORE_ACTIVITIES));
      const target = payload.subscribed ? "SUBSCRIBED" : payload.target_guid || "ALL";
      dispatch(activityActions.storeCoreActivities({ target: target, data: response.data }));
    })
    .catch(() => dispatch(error(reducerTypes.GET_CORE_ACTIVITIES)));
};

export const fetchCoreActivityTargets = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_USER_CORE_ACTIVITY_TARGETS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_ACTIVITY_TARGET(), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_USER_CORE_ACTIVITY_TARGETS));
      dispatch(activityActions.storeCoreActivityTargets(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_USER_CORE_ACTIVITY_TARGETS)));
};

export const createCoreActivityTarget = (target_guid) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_CORE_ACTIVITY_TARGET));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.CORE_ACTIVITY_TARGET(), {target_guid: target_guid}, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully subscribed.",
        duration: 3,
      });
      dispatch(success(reducerTypes.CREATE_CORE_ACTIVITY_TARGET));
      dispatch(fetchCoreActivityTargets());
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_CORE_ACTIVITY_TARGET));
      throw new Error(err);
    });
};

export const deleteCoreActivityTarget = (target_guid) => (dispatch) => {
  dispatch(request(reducerTypes.DELETE_CORE_ACTIVITY_TARGET));
  return CustomAxios()
    .delete(ENVIRONMENT.apiUrl + API.CORE_ACTIVITY_TARGET(target_guid), createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully unsubscribed.",
        duration: 3,
      });
      dispatch(success(reducerTypes.DELETE_CORE_ACTIVITY_TARGET));
      dispatch(fetchCoreActivityTargets());
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.DELETE_CORE_ACTIVITY_TARGET));
      throw new Error(err);
    });
};
