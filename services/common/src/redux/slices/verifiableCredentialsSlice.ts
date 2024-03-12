import { createAppSlice } from "@mds/common/redux/createAppSlice";
import { hideLoading, showLoading } from "react-redux-loading-bar";
import CustomAxios from "@mds/common/redux/customAxios";
import { ENVIRONMENT } from "@mds/common/constants";
import * as API from "@mds/common/constants/API";
import { RootState } from "@mds/common/redux/rootState";

const createRequestHeader = REQUEST_HEADER.createRequestHeader;

const rejectHandler = (action) => {
  console.log(action.error);
  console.log(action.error.stack);
};

interface VerifiableCredentialsConnection {
  party_guid: string;
  permit_amendment_guid: string;
  cred_exch_id: string;
  cred_exch_state: string;
  rev_reg_id: string;
  cred_rev_id: string;
}

interface VerifiableCredentialsState {
  verifiableCredentialConnections: VerifiableCredentialsConnection[];
}

const initialState: VerifiableCredentialsState = {
  verifiableCredentialConnections: [],
};

const reducers = (create) => ({
  fetchCredentialConnections: create.asyncThunk(
    async (payload: { partyGuid: string }, thunkAPI) => {
      const headers = createRequestHeader();
      thunkAPI.dispatch(showLoading());
      const { partyGuid } = payload;

      const response = await CustomAxios({
        errorToastMessage: "default",
      }).get(`${ENVIRONMENT.apiUrl}${API.VERIFIABLE_CREDENTIALS_CONNECTIONS(partyGuid)}`, headers);

      thunkAPI.dispatch(hideLoading());

      return response.data;
    },
    {
      fulfilled: (state: RootState, action) => {
        state.verifiableCredentialConnections = action.payload.records;
      },
      rejected: (state, action) => {
        rejectHandler(action);
      },
    }
  ),
  revokeCredential: create.asyncThunk(
    async (
      payload: { partyGuid: string; credential_exchange_id: string; comment: string },
      thunkAPI
    ) => {
      const headers = createRequestHeader();
      thunkAPI.dispatch(showLoading());
      const { partyGuid, credential_exchange_id, comment } = payload;
      console.log("payload", payload);

      const response = await CustomAxios({
        errorToastMessage: "default",
      }).post(
        `${ENVIRONMENT.apiUrl}${API.REVOKE_VERIFIABLE_CREDENTIAL(partyGuid)}`,
        { credential_exchange_id, comment },
        headers
      );

      thunkAPI.dispatch(hideLoading());

      return response.data;
    },
    {
      fulfilled: (state: RootState, action) => {
        // There is no return from the endpoint, so if the request has successfully fulfilled,
        // set the status of the connection to revoked
        state.verifiableCredentialConnections = state.verifiableCredentialConnections.map(
          (connection) => {
            if (connection.credential_exchange_id === action.payload.credential_exch_id) {
              return {
                ...connection,
                cred_exch_state: "revoked",
              };
            }
            return connection;
          }
        );
      },
    }
  ),
});

const selectors = {
  getCredentialConnections: (state): VerifiableCredentialsConnection[] => {
    return state.verifiableCredentialConnections;
  },
};

const verifiableCredentialsSlice = createAppSlice({
  name: "verifiableCredentialsSlice",
  initialState,
  reducers,
  selectors,
});

export const { fetchCredentialConnections, revokeCredential } = verifiableCredentialsSlice.actions;
export const { getCredentialConnections } = verifiableCredentialsSlice.getSelectors(
  (rootState: RootState) => rootState.verifiableCredentialConnections
);

const verifiableCredentialsReducer = verifiableCredentialsSlice.reducer;
export default verifiableCredentialsReducer;
