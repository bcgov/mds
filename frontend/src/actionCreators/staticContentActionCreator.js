import axios from "axios";
import { notification } from "antd";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as staticContentActions from "@/actions/staticContentActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

export const fetchMineDisturbanceOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_DISTURBANCE_OPTIONS));
  return axios
    .get(ENVIRONMENT.apiUrl + API.DISTURBANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_DISTURBANCE_OPTIONS));
      dispatch(staticContentActions.storeDisturbanceOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_DISTURBANCE_OPTIONS));
    });
};

export const fetchMineCommodityOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMMODITY_OPTIONS));
  return axios
    .get(ENVIRONMENT.apiUrl + API.COMMODITY_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMMODITY_OPTIONS));
      dispatch(staticContentActions.storeCommodityOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_COMMODITY_OPTIONS));
    });
};

export const fetchStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_STATUS_OPTIONS));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_STATUS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_STATUS_OPTIONS));
      dispatch(staticContentActions.storeStatusOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_STATUS_OPTIONS));
    });
};

export const fetchRegionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_REGION_OPTIONS));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_REGION, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_REGION_OPTIONS));
      dispatch(staticContentActions.storeRegionOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_REGION_OPTIONS));
    });
};

export const fetchMineTenureTypes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_TENURE_TYPES));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TENURE_TYPES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_TENURE_TYPES));
      dispatch(staticContentActions.storeTenureTypes(response.data));
    })
    .catch(() => {
      notification.error({
        message: String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_TENURE_TYPES));
    });
};

export const fetchMineTailingsRequiredDocuments = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
  return axios
    .get(ENVIRONMENT.apiUrl + API.MINE_TSF_REQUIRED_DOCUMENTS, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
      dispatch(staticContentActions.storeMineTSFRequiredDocuments(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_TSF_REQUIRED_REPORTS));
    });
};

export const fetchExpectedDocumentStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.EXPECTED_DOCUMENT}/status`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
      dispatch(staticContentActions.storeDocumentStatusOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_EXPECTED_DOCUMENT_STATUS));
    });
};

export const fetchPermitStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PERMIT_STATUS_OPTIONS));
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.PERMIT()}/status-codes`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PERMIT_STATUS_OPTIONS));
      dispatch(staticContentActions.storePermitStatusOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PERMIT_STATUS_OPTIONS));
    });
};

export const fetchApplicationStatusOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_APPLICATION_STATUS_OPTIONS));
  return axios
    .get(`${ENVIRONMENT.apiUrl + API.APPLICATIONS}/status-codes`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_APPLICATION_STATUS_OPTIONS));
      dispatch(staticContentActions.storeApplicationStatusOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_APPLICATION_STATUS_OPTIONS));
    });
};

export const setOptionsLoaded = () => (dispatch) => {
  dispatch(staticContentActions.loadedOptions(true));
};

export const fetchProvinceCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_PROVINCE_CODES));
  return axios
    .get(ENVIRONMENT.apiUrl + API.PROVINCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_PROVINCE_CODES));
      dispatch(staticContentActions.storeProvinceCodes(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_PROVINCE_CODES));
    });
};

export const fetchMineComplianceCodes = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_COMPLIANCE_CODES));
  return axios
    .get(ENVIRONMENT.apiUrl + API.COMPLIANCE_CODES, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_COMPLIANCE_CODES));
      dispatch(staticContentActions.storeComplianceCodes(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_COMPLIANCE_CODES));
    });
};
