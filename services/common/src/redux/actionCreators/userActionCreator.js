import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as userActions from "../actions/userActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchCoreUsers = () => (dispatch) => {
  dispatch(request(reducerTypes.GET_CORE_USERS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(reducerTypes.GET_CORE_USERS));
      dispatch(userActions.storeCoreUserList(response.data));
    })
    .catch(() => dispatch(error(reducerTypes.GET_CORE_USERS)));
};
