import axios from "axios";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as staticContentActions from "@/actions/staticContentActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { ENVIRONMENT } from "@/constants/environment";
import { createRequestHeader } from "@/utils/RequestHeaders";
import { getMineReportDefinitionOptions } from "@/selectors/staticContentSelectors";

export const fetchMineReportDefinitionOptions = () => (dispatch) => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_DEFINITIONS()}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
      dispatch(staticContentActions.storeMineReportDefinitionOptions(response.data));
      dispatch(hideLoading());
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
      dispatch(hideLoading());
    });
};
