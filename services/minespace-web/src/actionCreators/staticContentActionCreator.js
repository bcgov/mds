import axios from "axios";
import { notification } from "antd";
import { ENVIRONMENT } from "@common/constants/environment";
import { request, success, error } from "@/actions/genericActions";
import * as reducerTypes from "@/constants/reducerTypes";
import * as staticContentActions from "@/actions/staticContentActions";
import * as String from "@/constants/strings";
import * as API from "@/constants/API";
import { createRequestHeader } from "@/utils/RequestHeaders";

// eslint-disable-next-line import/prefer-default-export
export const fetchMineReportDefinitionOptions = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
  return axios
    .get(`${ENVIRONMENT.apiUrl}${API.MINE_REPORT_DEFINITIONS()}`, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
      dispatch(staticContentActions.storeMineReportDefinitionOptions(response.data));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.GET_MINE_REPORT_DEFINITION_OPTIONS));
    });
};
