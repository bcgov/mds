import { ENVIRONMENT } from "@mds/common";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "../constants/reducerTypes";
import * as verfiableCredentialActions from "../actions/verfiableCredentialActions";
import { createRequestHeader } from "../utils/RequestHeaders";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IVCInvitation } from "@mds/common";
import { AxiosResponse } from "axios";
import { notification } from "antd";

export const issueVCDigitalCredForPermit = (
  partyGuid: string,
  permitAmendmentGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
  const payload = {
    party_guid: partyGuid,
    permit_amendment_guid: permitAmendmentGuid,
  };

  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.ISSUE_VC));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/mines-act-permits`,
      payload,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Credential has been offered.",
        description: "Please check your wallet to accept this credential offer.",
        duration: 10,
      });
      dispatch(success(reducerTypes.ISSUE_VC));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.ISSUE_VC));
      dispatch(hideLoading("modal"));
      throw new Error(err);
    });
};

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

export const fetchVCWalletInvitations = (
  partyGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
  return CustomAxios()
    .get(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/oob-invitation/${partyGuid}`,
      createRequestHeader()
    )
    .then((response) => {
      dispatch(success(reducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
      dispatch(verfiableCredentialActions.storeVCConnectionInvitation(response.data));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch((err) => {
      dispatch(error(reducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
      dispatch(hideLoading("modal"));
      throw new Error(err);
    });
};
