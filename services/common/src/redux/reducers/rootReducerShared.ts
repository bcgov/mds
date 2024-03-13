import { createReducer } from "@mds/common/redux/utils/helpers";
import networkReducer from "@mds/common/redux/reducers/networkReducer";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import * as reducerTypes from "@mds/common/constants/reducerTypes";
import {
  activityReducer,
  authenticationReducer,
  complianceReducer,
  damReducer,
  documentViewerReducer,
  explosivesPermitReducer,
  externalAuthorizationReducer,
  incidentReducer,
  mineReducer,
  minespaceReducer,
  modalReducer,
  noticeOfDepartureReducer,
  noticeOfWorkReducer,
  orgbookReducer,
  partiesReducer,
  permitReducer,
  projectReducer,
  reportReducer,
  searchReducer,
  securitiesReducer,
  staticContentReducer,
  tailingsReducer,
  userReducer,
  varianceReducer,
  verifiableCredentialReducer,
  workInformationReducer,
} from "../reducers";
import reportSubmissionReducer from "@mds/common/components/reports/reportSubmissionSlice";
import verifiableCredentialsReducer from "@mds/common/redux/slices/verifiableCredentialsSlice";
export const sharedReducer = {
  ...activityReducer,
  ...authenticationReducer,
  ...complianceReducer,
  ...damReducer,
  ...documentViewerReducer,
  ...explosivesPermitReducer,
  ...externalAuthorizationReducer,
  ...incidentReducer,
  ...mineReducer,
  ...minespaceReducer,
  ...modalReducer,
  ...noticeOfDepartureReducer,
  ...noticeOfWorkReducer,
  ...orgbookReducer,
  ...partiesReducer,
  ...permitReducer,
  ...projectReducer,
  ...reportReducer,
  ...searchReducer,
  ...securitiesReducer,
  ...staticContentReducer,
  ...tailingsReducer,
  ...userReducer,
  ...varianceReducer,
  ...verifiableCredentialReducer,
  ...workInformationReducer,
  [reducerTypes.ADD_DOCUMENT_TO_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.ADD_DOCUMENT_TO_VARIANCE
  ),
  [reducerTypes.GET_VARIANCE_STATUS_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_VARIANCE_STATUS_OPTIONS
  ),
  [reducerTypes.GET_COMPLIANCE_CODES]: createReducer(
    networkReducer,
    reducerTypes.GET_COMPLIANCE_CODES
  ),
  form: formReducer,
  loadingBar: loadingBarReducer,
  reportSubmission: reportSubmissionReducer,
  verifiableCredentialConnections: verifiableCredentialsReducer,
};
