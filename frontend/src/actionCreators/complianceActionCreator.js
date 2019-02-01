import axios from "axios";
import { notification } from "antd";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import { request, success, error, clear } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as complianceActions from "@/actions/complianceActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchMineComplianceInfo = (mineNo, cacheOnly = false) => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_COMPLIANCE_INFO));

  const queryParam = cacheOnly ? `?cacheOnly=True` : "";
  const url = `${ENVIRONMENT.apiUrl + API.MINE_COMPLIANCE_INFO}/${mineNo}${queryParam}`;

  return axios
    .get(url, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(complianceActions.storeMineComplianceInfo(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.error.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(clear(reducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(hideLoading());
    });
};
