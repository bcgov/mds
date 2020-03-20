import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { request, success, error } from "../actions/genericActions";
import * as securitiesActions from "../actions/securitiesActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchMineBonds = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_BONDS));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_BONDS(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_BONDS));
      dispatch(securitiesActions.storeMineBonds(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_BONDS)));
};

export const fetchMineBondsById = (bondGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_BOND));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.BOND(bondGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_BOND));
      dispatch(securitiesActions.storeBond(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_BOND)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const createBond = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_BOND));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.BOND(), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added a new bond.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_BOND));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.CREATE_BOND)))
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateBond = (payload, bondGuid) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_BOND));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.BOND(bondGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated the bond record.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_BOND));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.UPDATE_BOND)))
    .finally(() => dispatch(hideLoading("modal")));
};
