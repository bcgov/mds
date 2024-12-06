import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as externalAuthActions from "../actions/externalAuthorizationActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

export const fetchMineEpicInformation = (mineGuid) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINE_EPIC_INFO));
  return CustomAxios()
    .get(`${ENVIRONMENT.apiUrl + API.EPIC_INFO(mineGuid)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_EPIC_INFO));
      // @ts-ignore
      dispatch(externalAuthActions.storeEpicInfo(response.data, mineGuid));
      return response;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.GET_MINE_EPIC_INFO));
    })
    .finally(() => dispatch(hideLoading()));
};
