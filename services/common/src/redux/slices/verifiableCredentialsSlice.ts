import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT, MINES_ACT_PERMITS_VC_LIST } from "@mds/common/constants";
import * as API from "@mds/common/constants/API";
import { RootState } from "@mds/common/redux/rootState";
import { DataSourceItemType } from "antd/lib/auto-complete";
import { debug } from "webpack";
import { a } from "@mds/common/tests/mocks/dataMocks";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};

interface MinesActPermitVerifiableCredentialsIssuance {
  party_guid: string;
  permit_amendment_guid: string;
  cred_exch_id: string;
  cred_exch_state: string;
  rev_reg_id: string;
  cred_rev_id: string;
  last_webhook_timestamp: Date;
}

interface VerifiableCredentialsState {
  minesActPermitVerifiableCredentialsIssuance: MinesActPermitVerifiableCredentialsIssuance[];
}

const initialState: VerifiableCredentialsState = {
  minesActPermitVerifiableCredentialsIssuance: [],
};

const verifiableCredentialsSlice = createAppSlice({
  name: "verifiableCredentialsSlice",
  initialState,
  reducers: (create) => ({
    fetchCredentialConnections: create.asyncThunk(
      async (payload: { partyGuid: string }, thunkAPI) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());
        const { partyGuid } = payload;

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).get(`${ENVIRONMENT.apiUrl}${MINES_ACT_PERMITS_VC_LIST(partyGuid)}`, headers);

        thunkAPI.dispatch(hideLoading());

        return response.data;
      },
      {
        fulfilled: (state, action) => {
          state.minesActPermitVerifiableCredentialsIssuance = action.payload.records;
        },
        rejected: (state: VerifiableCredentialsState, action) => {
          rejectHandler(action);
        },
      }
    ),
    revokeCredential: create.asyncThunk(
      async (
        payload: {
          partyGuid: string;
          credential_exchange_id: string;
          comment: string;
        },
        thunkAPI
      ) => {
        const headers = createRequestHeader();
        thunkAPI.dispatch(showLoading());
        const { partyGuid, credential_exchange_id, comment } = payload;

        const response = await CustomAxios({
          errorToastMessage: "default",
        }).post(
          `${ENVIRONMENT.apiUrl}${API.REVOKE_VERIFIABLE_CREDENTIAL(partyGuid)}`,
          {
            credential_exchange_id,
            comment,
          },
          headers
        );

        thunkAPI.dispatch(hideLoading());

        return { ...response.data, credential_exchange_id: credential_exchange_id };
      },
      {
        rejected: (state: VerifiableCredentialsState, action) => {
          rejectHandler(action);
        },
        fulfilled: (state, action) => {
          // The state here is a proxy "WritableDraft" object, so we need to convert it to a plain object
          // to be able to get the current values and update the state
          const verifiableCredentialIssuaneState = JSON.parse(
            JSON.stringify(state.minesActPermitVerifiableCredentialsIssuance)
          );

          state.minesActPermitVerifiableCredentialsIssuance = verifiableCredentialIssuaneState
            .map((conn) => {
              if (conn.cred_exch_id === action.payload.credential_exchange_id) {
                return { ...conn, cred_exch_state: "credential_revoked" };
              }
              return conn;
            })
            .sort((a, b) => a.last_webhook_timestamp - b.last_webhook_timestamp);
        },
      }
    ),
  }),
  selectors: {
    getMinesActPermitIssuance: (state): MinesActPermitVerifiableCredentialsIssuance[] => {
      return state.minesActPermitVerifiableCredentialsIssuance;
    },
  },
});

export const { fetchCredentialConnections, revokeCredential } = verifiableCredentialsSlice.actions;
export const { getMinesActPermitIssuance } = verifiableCredentialsSlice.getSelectors(
  (rootState: RootState) => rootState.verifiableCredentials
);

const verifiableCredentialsReducer = verifiableCredentialsSlice.reducer;
export default verifiableCredentialsReducer;
