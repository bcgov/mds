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

interface IUNTPCredentialIssueResponse {
  hash: string;
  existing: boolean;
  collision: boolean;
  response: unknown;
}

export const issueUNTPCredentialForPermitAmendment = (
  permitAmendmentGuid: string
): AppThunk<Promise<AxiosResponse<IUNTPCredentialIssueResponse>>> => (
  dispatch
): Promise<AxiosResponse<IUNTPCredentialIssueResponse>> => {
    dispatch(showLoading("modal"));
    dispatch(request(NetworkReducerTypes.ISSUE_UNTP_CREDENTIAL));
    return CustomAxios()
      .post<IUNTPCredentialIssueResponse>(
        `${ENVIRONMENT.apiUrl}/verifiable-credentials/credentials/issue`,
        { permit_amendment_guid: permitAmendmentGuid },
        createRequestHeader()
      )
      .then((response) => {
        const { existing } = response.data;
        const message = existing
          ? "Credential already published"
          : "UNTP Conformity Credential has been issued.";

        notification.success({
          message,
          duration: 10,
        });
        dispatch(success(NetworkReducerTypes.ISSUE_UNTP_CREDENTIAL));
        return response;
      })
      .catch((err) => {
        dispatch(error(NetworkReducerTypes.ISSUE_UNTP_CREDENTIAL));
        throw err;
      })
      .finally(() => dispatch(hideLoading("modal")));
  };

export const revokeUNTPCredentialForPermitAmendment = (
  permitAmendmentGuid: string,
  revokedReason: string
): AppThunk<Promise<AxiosResponse>> => (dispatch): Promise<AxiosResponse> => {
  dispatch(showLoading("modal"));
  dispatch(request(NetworkReducerTypes.REVOKE_UNTP_CREDENTIAL));
  return CustomAxios()
    .post(
      `${ENVIRONMENT.apiUrl}/verifiable-credentials/credentials/revoke`,
      {
        permit_amendment_guid: permitAmendmentGuid,
        revoked_reason: revokedReason,
      },
      createRequestHeader()
    )
    .then((response) => {
      notification.success({
        message: "UNTP Conformity Credential has been revoked.",
        duration: 10,
      });
      dispatch(success(NetworkReducerTypes.REVOKE_UNTP_CREDENTIAL));
      return response;
    })
    .catch((err) => {
      dispatch(error(NetworkReducerTypes.REVOKE_UNTP_CREDENTIAL));
      throw err;
    })
    .finally(() => dispatch(hideLoading("modal")));
};

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
      .catch((err) => {
        dispatch(error(NetworkReducerTypes.ISSUE_VC));
        dispatch(hideLoading("modal"));
        throw err;
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
      .catch((err) => {
        dispatch(error(NetworkReducerTypes.FETCH_VC_WALLET_CONNECTION_INVITATIONS));
        dispatch(hideLoading("modal"));
        throw err;
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
      .catch((err) => {
        dispatch(error(NetworkReducerTypes.DELETE_VC_WALLET_CONNECTION));
        dispatch(hideLoading("modal"));
        throw err;
      });
  };
