import * as actionTypes from "../constants/actionTypes";
import { VERIFIABLE_CREDENTIALS } from "../constants/reducerTypes";
import { RootState } from "@/App";
import { IVCInvitation, LOADING_STATUS } from "@mds/common";

/**
 * @file verifiableCredentialReducer.js
 * all data associated with verificable credential records.
 */

interface verifiableCredentialState {
  vcWalletConnectionInvitation: IVCInvitation;
}

const initialState = {
  vcWalletConnectionInvitation: {} as IVCInvitation,
};

const verifiableCredentialReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VC_WALLET_CONNECTION_INVITATION:
      return {
        ...state,
        vcWalletConnectionInvitation: action.payload,
      };
    default:
      return state;
  }
};

const verifiableCredentialReducerObject = {
  [VERIFIABLE_CREDENTIALS]: verifiableCredentialReducer,
};

export const getVCWalletConnectionInvitation = (state: RootState) =>
  state[VERIFIABLE_CREDENTIALS].vcWalletConnectionInvitation;

export default verifiableCredentialReducerObject;
