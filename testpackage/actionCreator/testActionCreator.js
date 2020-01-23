import { showLoading, hideLoading } from "react-redux-loading-bar";
import axios from "axios";
import { request, success, error, clear } from "../actions/genericActions";
import * as API from "../constants/API";
import * as reducerTypes from "../constants/reducerTypes";
import * as testActions from "../actions/testActions";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchTestInfo = (mineNo, headers, silent = false) => dispatch => {
  dispatch(showLoading());
  dispatch(request(reducerTypes.GET_MINE_TEST_INFO));
  dispatch(testActions.storeTestInfo({}));
  return axios()
    .get(`http://localhost:5000${API.MINE_COMPLIANCE_SUMMARY(mineNo)}`, headers)
    .then(response => {
      dispatch(success(reducerTypes.GET_MINE_TEST_INFO));
      dispatch(testActions.storeTestInfo(response.data));
      return response.data;
    })
    .catch(() => {
      dispatch(error(reducerTypes.GET_MINE_TEST_INFO));
      dispatch(clear(reducerTypes.GET_MINE_TEST_INFO));
    })
    .finally(() => dispatch(hideLoading()));
};
