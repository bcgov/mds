import { ENVIRONMENT } from "@mds/common/constants/environment";
import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as userActions from "../actions/userActions";
import * as API from "@mds/common/constants/API";
import { createRequestHeader } from "../utils/RequestHeaders";
import CustomAxios from "../customAxios";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const fetchCoreUsers = () => (dispatch) => {
  dispatch(request(NetworkReducerTypes.GET_CORE_USERS));
  return CustomAxios()
    .get(ENVIRONMENT.apiUrl + API.CORE_USER, createRequestHeader())
    .then((response) => {
      dispatch(success(NetworkReducerTypes.GET_CORE_USERS));
      dispatch(userActions.storeCoreUserList(response.data));
    })
    .catch(() => dispatch(error(NetworkReducerTypes.GET_CORE_USERS)));
};
