import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error, clear } from "../actions/genericActions";
import * as complianceActions from "../actions/complianceActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/API";
import { ENVIRONMENT } from "@mds/common";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchMineComplianceInfo = (mineNo, silent = false) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_COMPLIANCE_INFO));
  dispatch(complianceActions.storeMineComplianceInfo({}));

  const errorToastMessage = silent ? "" : undefined;
  return CustomAxios({ errorToastMessage })
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_COMPLIANCE_SUMMARY(mineNo)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(complianceActions.storeMineComplianceInfo(response.data));
      return response.data;
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(clear(reducerTypes.GET_MINE_COMPLIANCE_INFO));
    })
    .finally(() => dispatch(hideLoading()));
};
