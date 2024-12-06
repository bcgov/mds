import { showLoading, hideLoading } from "react-redux-loading-bar";
import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error, clear } from "../actions/genericActions";
import * as complianceActions from "../actions/complianceActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IComplianceArticle } from "@mds/common/interfaces";

// This file is anticipated to have multiple exports

export const fetchMineComplianceInfo = (
  mineNo: string,
  silent = false
): AppThunk<Promise<IComplianceArticle>> => (dispatch): Promise<IComplianceArticle> => {
  dispatch(showLoading());
  dispatch(request(NetworkReducerTypes.GET_MINE_COMPLIANCE_INFO));
  dispatch(complianceActions.storeMineComplianceInfo({}));

  const errorToastMessage = silent ? "" : undefined;
  return CustomAxios({ errorToastMessage })
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_COMPLIANCE_SUMMARY(mineNo)}`, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(complianceActions.storeMineComplianceInfo(response.data));
      return response.data;
    })
    .catch(() => {
      dispatch(error(NetworkReducerTypes.GET_MINE_COMPLIANCE_INFO));
      dispatch(clear(NetworkReducerTypes.GET_MINE_COMPLIANCE_INFO));
    })
    .finally(() => dispatch(hideLoading()));
};
