import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as verfiableCredentialActions from "../actions/verfiableCredentialActions";
import { createRequestHeader } from "../utils/RequestHeaders";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import CustomAxios from "../customAxios";

export const createVCWalletInvitation = (party_guid) => (dispatch) => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/oob-invitation/${party_guid}`,
      null,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
      dispatch(verfiableCredentialActions.storeVCConnectionInvitation(response.data));
      dispatch(hideLoading("modal"));
    })
    .catch((err) => {
      notification.error({
        message: err.response ? err.response.data.message : String.ERROR,
        duration: 10,
      });
      dispatch(error(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
      dispatch(hideLoading("modal"));
    });
};
