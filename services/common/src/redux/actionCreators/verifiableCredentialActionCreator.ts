import { request, success, error } from "../actions/genericActions";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import * as verfiableCredentialActions from "../actions/verfiableCredentialActions";
import { createRequestHeader } from "../utils/RequestHeaders";
import { showLoading, hideLoading } from "react-redux-loading-bar";
import CustomAxios from "../customAxios";
import { AppThunk } from "@mds/common/interfaces/appThunk.type";
import { IVCInvitation } from "@mds/common/interfaces";
import { AxiosResponse } from "axios";
import { notification } from "antd";
import { ENVIRONMENT } from "@mds/common/constants/environment";

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
    dispatch(request(NetworkReducerTypes.ISSUE_VC));
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
        dispatch(success(NetworkReducerTypes.ISSUE_VC));
        dispatch(hideLoading("modal"));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.ISSUE_VC));
        dispatch(hideLoading("modal"));
      });
  };

export const createVCWalletInvitation = (
  partyGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
    dispatch(showLoading("modal"));
    dispatch(request(NetworkReducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
    return CustomAxios()
      .post(
        `${ENVIRONMENT.apiUrl}/verifiable-credentials/${partyGuid}/oob-invitation`,
        null,
        createRequestHeader()
      )
      .then((response) => {
        dispatch(success(NetworkReducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
        dispatch(verfiableCredentialActions.storeVCConnectionInvitation(response.data));
        dispatch(hideLoading("modal"));
        return response;
      })
      .catch((err) => {
        dispatch(error(NetworkReducerTypes.CREATE_VC_WALLET_CONNECTION_INVITATION));
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
    dispatch(request(NetworkReducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
    return CustomAxios()
      .get(
        `${ENVIRONMENT.apiUrl}/verifiable-credentials/oob-invitation/${partyGuid}`,
        createRequestHeader()
      )
      .then((response) => {
        dispatch(success(NetworkReducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
        dispatch(verfiableCredentialActions.storeVCConnectionInvitation(response.data));
        dispatch(hideLoading("modal"));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
        dispatch(hideLoading("modal"));
      });
  };

export const deletePartyWalletConnection = (
  partyGuid: string
): AppThunk<Promise<AxiosResponse<IVCInvitation>>> => (
  dispatch
): Promise<AxiosResponse<IVCInvitation>> => {
    dispatch(showLoading("modal"));
    dispatch(request(NetworkReducerTypes.DELETE_VC_WALLET_CONNECTION));
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
        dispatch(success(NetworkReducerTypes.DELETE_VC_WALLET_CONNECTION));
        dispatch(hideLoading("modal"));
        return response;
      })
      .catch(() => {
        dispatch(error(NetworkReducerTypes.DELETE_VC_WALLET_CONNECTION));
        dispatch(hideLoading("modal"));
      });
  };
