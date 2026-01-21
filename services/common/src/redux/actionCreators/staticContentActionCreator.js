import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as staticContentActions from "../actions/staticContentActions";
import { fetchInspectors as fetchInspectorsAction, fetchProjectLeads as fetchProjectLeadsAction } from "@mds/common/redux/slices/partiesSlice";
import * as String from "@mds/common/constants/strings";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const loadBulkStaticContent = () => (dispatch) => {
  dispatch(request(NetworkReducerTypes.LOAD_ALL_STATIC_CONTENT));
  dispatch(showLoading());
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_STATIC_CONTENT, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.LOAD_ALL_STATIC_CONTENT));
      dispatch(staticContentActions.storeBulkStaticContent(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.LOAD_ALL_STATIC_CONTENT)))
    .finally(() => dispatch(hideLoading()));
};

export const fetchInspectors = () => (dispatch) => {
  return dispatch(fetchInspectorsAction());
};

export const fetchProjectLeads = () => (dispatch) => {
  return dispatch(fetchProjectLeadsAction());
};
