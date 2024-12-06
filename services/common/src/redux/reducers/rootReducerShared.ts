import { createReducer } from "@mds/common/redux/utils/helpers";
import networkReducer from "@mds/common/redux/reducers/networkReducer";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
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
import regionsReducer from "@mds/common/redux/slices/regionsSlice";
import complianceCodeReducer, { complianceCodeReducerType } from "../slices/complianceCodesSlice";
import spatialDataReducer, { spatialDataReducerType } from "../slices/spatialDataSlice";
import permitServiceReducer, { permitServiceReducerType } from "../slices/permitServiceSlice";
import searchConditionCategoriesReducer, { searchConditionCategoriesType } from "../slices/permitConditionCategorySlice";
import helpReducer, { helpReducerType } from "../slices/helpSlice";

const networkReducers = Object.fromEntries(Object.entries(NetworkReducerTypes).map(([key, value]) =>
  [NetworkReducerTypes[key], createReducer(networkReducer, value)]
));

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
  form: formReducer,
  loadingBar: loadingBarReducer,
  reportSubmission: reportSubmissionReducer,
  verifiableCredentials: verifiableCredentialsReducer,
  regions: regionsReducer,
  [spatialDataReducerType]: spatialDataReducer,
  [complianceCodeReducerType]: complianceCodeReducer,
  [permitServiceReducerType]: permitServiceReducer,
  [helpReducerType]: helpReducer,
  [searchConditionCategoriesType]: searchConditionCategoriesReducer,
  ...networkReducers
};
