import { ENVIRONMENT } from "@mds/common/constants";
import { request, success, error } from "../actions/genericActions";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import * as verfiableCredentialActions from "../actions/verfiableCredentialActions";
import { createRequestHeader } from "../utils/RequestHeaders";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IVCInvitation } from "@mds/common/interfaces";
import { AxiosResponse } from "axios";
import { notification } from "antd";

export const issueVCDigitalCredForPermit = (
  partyGuid: string,
  permitAmendmentGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
  const payload = {
    permit_amendment_guid: permitAmendmentGuid,
  };

  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.ISSUE_VC));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/${partyGuid}/mines-act-permits`,
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
    .catch(() => {
      dispatch(error(reducerTypes.ISSUE_VC));
      dispatch(hideLoading("modal"));
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
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/${partyGuid}/oob-invitation`,
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
    .catch(() => {
      dispatch(error(reducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
      dispatch(hideLoading("modal"));
    });
};

export const deletePartyWalletConnection = (
  partyGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
  dispatch(showLoading("modal"));
  dispatch(request(reducerTypes.DELETE_VC_WALLET_CONNECTION));
  return CustomAxios()
    .delete(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/${partyGuid}/connection/`,
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "Digital Wallet Connection Deleted",
        description: "The user may establish a new connection through minespace",
        duration: 10,
      });
      dispatch(success(reducerTypes.DELETE_VC_WALLET_CONNECTION));
      dispatch(hideLoading("modal"));
      return response;
    })
    .catch(() => {
      dispatch(error(reducerTypes.DELETE_VC_WALLET_CONNECTION));
      dispatch(hideLoading("modal"));
    });
};
