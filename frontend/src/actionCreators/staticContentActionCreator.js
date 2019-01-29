import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as staticContentActions from "@/actions/staticContentActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const fetchMineDisturbanceOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_DISTURBANCE_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.DISTURBANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_DISTURBANCE_OPTIONS));
      dispatch(staticContentActions.storeDisturbanceOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_DISTURBANCE_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineCommodityOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMMODITY_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.COMMODITY_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMMODITY_OPTIONS));
      dispatch(staticContentActions.storeCommodityOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_COMMODITY_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_STATUS_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_STATUS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(staticContentActions.storeStatusOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchRegionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_REGION_OPTIONS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_REGION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REGION_OPTIONS));
      dispatch(staticContentActions.storeRegionOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_REGION_OPTIONS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineTenureTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_TENURE_TYPES));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TENURE_TYPES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_TENURE_TYPES));
      dispatch(staticContentActions.storeTenureTypes(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_TENURE_TYPES));
      dispatch(hideLoading("modal"));
    });
};

export const fetchMineTailingsRequiredDocuments = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
  dispatch(showLoading("modal"));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TSF_REQUIRED_DOCUMENTS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
      dispatch(staticContentActions.storeMineTSFRequiredDocuments(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
      dispatch(hideLoading("modal"));
    });
};

export const fetchExpectedDocumentStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
  dispatch(showLoading("modal"));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/status`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(staticContentActions.storeDocumentStatusOptions(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(hideLoading("modal"));
    });
};

export const setOptionsLoaded = () => (dispatch) => {
  dispatch(staticContentActions.loadedOptions(true));
};
