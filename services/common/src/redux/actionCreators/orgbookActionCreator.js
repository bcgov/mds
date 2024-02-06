import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as orgbookActions from "../actions/orgbookActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const searchOrgBook = (search) => (dispatch) => {
  dispatch(request(reducerTypes.ORGBOOK_SEARCH));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_SEARCH(search), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.ORGBOOK_SEARCH));
      dispatch(orgbookActions.storeSearchOrgBookResults(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.ORGBOOK_SEARCH)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchOrgBookCredential = (credentialId) => (dispatch) => {
  dispatch(request(reducerTypes.ORGBOOK_CREDENTIAL));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_CREDENTIAL(credentialId), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.ORGBOOK_CREDENTIAL));
      dispatch(orgbookActions.storeOrgBookCredential(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.ORGBOOK_CREDENTIAL)))
    .finally(() => dispatch(hideLoading()));
};

export const verifyOrgBookCredential = (credentialId) => (dispatch) => {
  dispatch(request(reducerTypes.ORGBOOK_VERIFY));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_VERIFY(credentialId), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.ORGBOOK_VERIFY));
      return response.data;
    })
    .catch(() => dispatch(error(reducerTypes.ORGBOOK_VERIFY)))
    .finally(() => dispatch(hideLoading()));
};
