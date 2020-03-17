import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as staticContentActions from "../actions/staticContentActions";
import * as partyActions from "../actions/partyActions";
import * as String from "../constants/strings";
import * as API from "../constants/API";
import { ENVIRONMENT } from "../constants/environment";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const loadBulkStaticContent = () => (dispatch) => {
  dispatch(request(reducerTypes.LOAD_ALL_STATIC_CONTENT));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_STATIC_CONTENT, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.LOAD_ALL_STATIC_CONTENT));
      dispatch(staticContentActions.storeBulkStaticContent(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.LOAD_ALL_STATIC_CONTENT)));
};

export const fetchInspectors = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_INSPECTORS));
  return CustomAxios()
    .get(
      ENVIRONMENT.apiUrl +
        API.PARTIES_LIST_QUERY({
          per_page: "all",
          business_role: String.INCIDENT_FOLLOWUP_ACTIONS.inspector,
        }),
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.GET_INSPECTORS));
      dispatch(partyActions.storeInspectors(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_INSPECTORS)));
};
