import { showLoading, hideLoading } from "react-redux-loading-bar";
import { AxiosResponse } from "axios";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as orgbookActions from "../actions/orgbookActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IBCRegistrationSearchResult } from "@mds/common/interfaces";

export const searchBCRegistrations = (search: string): AppThunk => (dispatch) => {
  dispatch(request(NetworkReducerTypes.BC_REGISTRATION_SEARCH));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.BC_REGISTRATION_SEARCH(search), createRequestHeader())
    .then((response: AxiosResponse<IBCRegistrationSearchResult[]>) => {
      dispatch(success(NetworkReducerTypes.BC_REGISTRATION_SEARCH));
      dispatch(orgbookActions.storeBCRegistrationResults(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.BC_REGISTRATION_SEARCH)))
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