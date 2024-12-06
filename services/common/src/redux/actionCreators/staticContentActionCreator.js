import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as staticContentActions from "../actions/staticContentActions";
import * as partyActions from "../actions/partyActions";
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
  dispatch(request(NetworkReducerTypes.GET_INSPECTORS));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
      API.PARTIES_LIST_QUERY({
        per_page: "all",
        business_role: String.BUSINESS_ROLES.inspector,
      }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_INSPECTORS));
      dispatch(partyActions.storeInspectors(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_INSPECTORS)));
};

export const fetchProjectLeads = () => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_PROJECT_LEADS));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
      API.PARTIES_LIST_QUERY({
        per_page: "all",
        business_role: String.BUSINESS_ROLES.projectLead,
      }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_PROJECT_LEADS));
      dispatch(partyActions.storeProjectLeads(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_PROJECT_LEADS)));
};
