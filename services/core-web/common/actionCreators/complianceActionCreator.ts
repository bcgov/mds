import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error, clear } from "../actions/genericActions";
import * as complianceActions from "../actions/complianceActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as API from "../constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@/store/appThunk.type";
import { IComplianceArticle } from "@mds/common";

// This file is anticipated to have multiple exports

export const fetchMineComplianceInfo = (
  mineNo: string,
  silent = false
): AppThunk<Promise<IComplianceArticle>> => (dispatch): Promise<IComplianceArticle> => {
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
