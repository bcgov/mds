import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as Strings from "@/constants/strings";
import * as incidentActions from "@/actions/incidentsActions";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import CustomAxios from "@/customAxios";

// eslint-disable-next-line import/prefer-default-export
export const fetchIncidents = (payload) => (dispatch) => {
  dispatch(request(reducerTypes.GET_INCIDENTS));
  dispatch(showLoading());
  return CustomAxios({ errorToastMessage: Strings.ERROR })
    .get(ENVIRONMENT.apiUrl + API.INCIDENTS(payload), createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_INCIDENTS));
      dispatch(incidentActions.storeIncidents(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_INCIDENTS)))
    .finally(() => dispatch(hideLoading()));
};
