import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as verfiableCredentialActions from "../actions/verfiableCredentialActions";
import { createRequestHeader } from "../utils/RequestHeaders";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import CustomAxios from "../customAxios";
import { AppThunk } from "@/store/appThunk.type";
import { IVCInvitation } from "@mds/common";
import { AxiosResponse } from "axios";

export const createVCWalletInvitation = (
  partyGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/oob-invitation/${partyGuid}`,
      null,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
      dispatch(verfiableCredentialActions.storeVCConnectionInvitation(response.data));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
      dispatch(hideLoading("modal"));
      throw new Error(err);
    });
};
