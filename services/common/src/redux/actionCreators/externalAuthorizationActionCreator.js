import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as externalAuthActions from "../actions/externalAuthorizationActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchMineEpicInformation = (mineGuid) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_EPIC_INFO));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.EPIC_INFO(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_EPIC_INFO));
      // @ts-ignore
      dispatch(externalAuthActions.storeEpicInfo(response.data, mineGuid));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.GET_MINE_EPIC_INFO));
      throw new Error(err);
    })
    .finally(() => dispatch(hideLoading()));
};
