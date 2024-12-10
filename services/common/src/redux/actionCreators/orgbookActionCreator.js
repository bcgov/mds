import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as orgbookActions from "../actions/orgbookActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const searchOrgBook = (search) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.ORGBOOK_SEARCH));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_SEARCH(search), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.ORGBOOK_SEARCH));
      dispatch(orgbookActions.storeSearchOrgBookResults(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.ORGBOOK_SEARCH)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchOrgBookCredential = (credentialId) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.ORGBOOK_CREDENTIAL));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_CREDENTIAL(credentialId), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.ORGBOOK_CREDENTIAL));
      dispatch(orgbookActions.storeOrgBookCredential(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.ORGBOOK_CREDENTIAL)))
    .finally(() => dispatch(hideLoading()));
};

export const verifyOrgBookCredential = (credentialId) => (dispatch) => {
  dispatch(request(NetworkReducerTypes.ORGBOOK_VERIFY));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.ORGBOOK_VERIFY(credentialId), createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.ORGBOOK_VERIFY));
      return response.data;
    })
    .catch(() => dispatch(error(NetworkReducerTypes.ORGBOOK_VERIFY)))
    .finally(() => dispatch(hideLoading()));
};
