import { showLoading, hideLoading } from "react-redux-loading-bar";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import * as securitiesActions from "../actions/securitiesActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as API from "@mds/common/constants/API";
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
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_BOND));
    })
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
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_BOND));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const transferBond = (payload, bondGuid) => (dispatch) => {
  dispatch(request(reducerTypes.TRANSFER_BOND));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.BOND_TRANSFER(bondGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully transferred the bond.",
        duration: 10,
      });
      dispatch(success(reducerTypes.TRANSFER_BOND));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.TRANSFER_BOND));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const fetchMineReclamationInvoices = (mineGuid) => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_RECLAMATION_INVOICES));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_RECLAMATION_INVOICES(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_RECLAMATION_INVOICES));
      dispatch(securitiesActions.storeMineReclamationInvoices(response.data));
      return response;
    })
    .catch(() => dispatch(error(reducerTypes.GET_MINE_RECLAMATION_INVOICES)));
};

export const createReclamationInvoice = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.CREATE_RECLAMATION_INVOICE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .post(ENVIRONMENT.apiUrl + API.RECLAMATION_INVOICE(), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully added a new reclamation invoice.",
        duration: 10,
      });
      dispatch(success(reducerTypes.CREATE_RECLAMATION_INVOICE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.CREATE_RECLAMATION_INVOICE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};

export const updateReclamationInvoice = (payload, invoiceGuid) => (dispatch) => {
  dispatch(request(reducerTypes.UPDATE_RECLAMATION_INVOICE));
  dispatch(showLoading("modal"));
  return CustomAxios()
    .put(ENVIRONMENT.apiUrl + API.RECLAMATION_INVOICE(invoiceGuid), payload, createRequestHeader())
    .then((response) => {
      notification.success({
        message: "Successfully updated the invoice record.",
        duration: 10,
      });
      dispatch(success(reducerTypes.UPDATE_RECLAMATION_INVOICE));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.UPDATE_RECLAMATION_INVOICE));
    })
    .finally(() => dispatch(hideLoading("modal")));
};
