import { createReducer } from "@mds/common/redux/utils/helpers";
import networkReducer from "@mds/common/redux/reducers/networkReducer";
import { reducer as formReducer } from "@mds/common/components/forms/form";
import { loadingBarReducer } from "react-redux-loading-bar";
import { NetworkReducerTypes } from "@mds/common/constants/networkReducerTypes";
import {
  activityReducer,
  authenticationReducer,
  complianceReducer,
  documentViewerReducer,
  explosivesPermitReducer,
  externalAuthorizationReducer,
  incidentReducer,
  mineReducer,
  modalReducer,
  noticeOfDepartureReducer,
  noticeOfWorkReducer,
  orgbookReducer,
  partiesReducer,
  permitReducer,
  projectReducer,
  searchReducer,
  securitiesReducer,
  staticContentReducer,
  varianceReducer,
  verifiableCredentialReducer,
  workInformationReducer,
} from "../reducers";
import reportSubmissionReducer from "@mds/common/components/reports/reportSubmissionSlice";
import verifiableCredentialsReducer from "@mds/common/redux/slices/verifiableCredentialsSlice";

import regionsReducer from "@mds/common/redux/slices/regionsSlice";
import complianceCodeReducer, { complianceCodeReducerType } from "../slices/complianceCodesSlice";
import complianceReportReducer, { complianceReportReducerType } from "../slices/complianceReportsSlice";
import spatialDataReducer, { spatialDataReducerType } from "../slices/spatialDataSlice";
import permitServiceReducer, { permitServiceReducerType } from "../slices/permitServiceSlice";
import searchConditionCategoriesReducer, {
  searchConditionCategoriesType,
} from "../slices/permitConditionCategorySlice";
import helpReducer, { helpReducerType } from "../slices/helpSlice";
import userReducer, { userReducerType } from "@mds/common/redux/slices/userSlice";
import minespaceReducer, { minespaceReducerType } from "../slices/minespaceSlice";
import permitConditionTagReducer, { permitConditionTagReducerType } from "@mds/common/redux/slices/permitConditionTagSlice";
import mineReportPermitRequirementReducer, { mineReportPermitRequirementReducerType } from "../slices/mineReportPermitRequirementSlice";
import permitConditionDiffReducer, { permitConditionDiffReducerType } from "../slices/permitConditionDiffSlice";
import permitSearchReducer, { permitSearchReducerType } from "../slices/permitSearchSlice";
import damReducer, { damReducerType } from "../slices/damSlice";
import tailingsReducer, { tsfReducerType } from "../slices/tailingsSlice";
import amsFinalAppReducer, { amsAppReducerType } from "../slices/amsFinalApplicationSlice";
import mineReportStatsReducer, { mineReportStatsReducerType } from "../slices/mineReportStatsSlice";
import reportReducer, { reportReducerType } from "@mds/common/redux/slices/reportSlice";

const networkReducers = Object.fromEntries(Object.entries(NetworkReducerTypes).map(([key, value]) =>
  [NetworkReducerTypes[key], createReducer(networkReducer, value)]
));

export const sharedReducer = {
  ...activityReducer,
  ...authenticationReducer,
  ...complianceReducer,
  ...documentViewerReducer,
  ...explosivesPermitReducer,
  ...externalAuthorizationReducer,
  ...incidentReducer,
  ...mineReducer,
  ...modalReducer,
  ...noticeOfDepartureReducer,
  ...noticeOfWorkReducer,
  ...orgbookReducer,
  ...partiesReducer,
  ...permitReducer,
  ...projectReducer,
  ...searchReducer,
  ...securitiesReducer,
  ...staticContentReducer,
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
  [damReducerType]: damReducer,
  [tsfReducerType]: tailingsReducer,
  [complianceReportReducerType]: complianceReportReducer,
  [permitServiceReducerType]: permitServiceReducer,
  [helpReducerType]: helpReducer,
  [searchConditionCategoriesType]: searchConditionCategoriesReducer,
  [userReducerType]: userReducer,
  [mineReportPermitRequirementReducerType]: mineReportPermitRequirementReducer,
  [permitConditionDiffReducerType]: permitConditionDiffReducer,
  [permitSearchReducerType]: permitSearchReducer,
  [permitConditionTagReducerType]: permitConditionTagReducer,
  [amsAppReducerType]: amsFinalAppReducer,
  [mineReportStatsReducerType]: mineReportStatsReducer,
  [minespaceReducerType]: minespaceReducer,
  [reportReducerType]: reportReducer,
  ...networkReducers
};
