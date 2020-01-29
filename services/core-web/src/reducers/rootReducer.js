import { combineReducers } from "redux";
import { reducer as formReducer } from "redux-form";
import { loadingBarReducer } from "react-redux-loading-bar";
import {
  mineReducer,
  complianceReducer,
  partiesReducer,
  modalReducer,
  authenticationReducer,
  staticContentReducer,
  minespaceReducer,
  permitReducer,
  searchReducer,
  varianceReducer,
  incidentReducer,
  userReducer,
  reportReducer,
  noticeOfWorkReducer,
} from "@common/reducers";
import * as reducerTypes from "@common/constants/reducerTypes";
import { createReducer } from "@common/utils/helpers";
import networkReducer from "./networkReducer";

export const reducerObject = {
  form: formReducer,
  loadingBar: loadingBarReducer,
  ...authenticationReducer,
  ...mineReducer,
  ...partiesReducer,
  ...permitReducer,
  ...modalReducer,
  ...complianceReducer,
  ...staticContentReducer,
  ...minespaceReducer,
  ...searchReducer,
  ...varianceReducer,
  ...incidentReducer,
  ...reportReducer,
  ...userReducer,
  ...noticeOfWorkReducer,
  [reducerTypes.CREATE_PARTY]: createReducer(networkReducer, reducerTypes.CREATE_PARTY),
  [reducerTypes.UPDATE_PARTY]: createReducer(networkReducer, reducerTypes.UPDATE_PARTY),
  [reducerTypes.GET_PARTIES]: createReducer(networkReducer, reducerTypes.GET_PARTIES),
  [reducerTypes.GET_PARTY]: createReducer(networkReducer, reducerTypes.GET_PARTY),
  [reducerTypes.CREATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.CREATE_MINE_RECORD),
  [reducerTypes.GET_MINE_RECORDS]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORDS),
  [reducerTypes.GET_MINE_RECORD]: createReducer(networkReducer, reducerTypes.GET_MINE_RECORD),
  [reducerTypes.GET_MINE_NAME_LIST]: createReducer(networkReducer, reducerTypes.GET_MINE_NAME_LIST),
  [reducerTypes.GET_STATUS_OPTIONS]: createReducer(networkReducer, reducerTypes.GET_STATUS_OPTIONS),
  [reducerTypes.GET_REGION_OPTIONS]: createReducer(networkReducer, reducerTypes.GET_REGION_OPTIONS),
  [reducerTypes.GET_TENURE_TYPES]: createReducer(networkReducer, reducerTypes.GET_TENURE_TYPES),
  [reducerTypes.GET_DISTURBANCE_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_DISTURBANCE_OPTIONS
  ),
  [reducerTypes.GET_COMMODITY_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_COMMODITY_OPTIONS
  ),
  [reducerTypes.UPDATE_MINE_RECORD]: createReducer(networkReducer, reducerTypes.UPDATE_MINE_RECORD),
  [reducerTypes.ADD_MINE_MANAGER]: createReducer(networkReducer, reducerTypes.ADD_MINE_MANAGER),
  [reducerTypes.ADD_PERMITTEE]: createReducer(networkReducer, reducerTypes.ADD_PERMITTEE),
  [reducerTypes.CREATE_TSF]: createReducer(networkReducer, reducerTypes.CREATE_TSF),
  [reducerTypes.GET_MINE_COMPLIANCE_INFO]: createReducer(
    networkReducer,
    reducerTypes.GET_MINE_COMPLIANCE_INFO
  ),
  [reducerTypes.REMOVE_MINE_TYPE]: createReducer(networkReducer, reducerTypes.REMOVE_MINE_TYPE),
  [reducerTypes.GET_PROVINCE_CODES]: createReducer(networkReducer, reducerTypes.GET_PROVINCE_CODES),
  [reducerTypes.SUBSCRIBE]: createReducer(networkReducer, reducerTypes.SUBSCRIBE),
  [reducerTypes.UNSUBSCRIBE]: createReducer(networkReducer, reducerTypes.UNSUBSCRIBE),
  [reducerTypes.GET_COMPLIANCE_CODES]: createReducer(
    networkReducer,
    reducerTypes.GET_COMPLIANCE_CODES
  ),
  [reducerTypes.ADD_DOCUMENT_TO_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.ADD_DOCUMENT_TO_VARIANCE
  ),
  [reducerTypes.CREATE_MINE_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.CREATE_MINE_VARIANCE
  ),
  [reducerTypes.UPDATE_MINE_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.UPDATE_MINE_VARIANCE
  ),
  [reducerTypes.GET_VARIANCES]: createReducer(networkReducer, reducerTypes.GET_VARIANCES),
  [reducerTypes.GET_VARIANCE]: createReducer(networkReducer, reducerTypes.GET_VARIANCE),
  [reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE]: createReducer(
    networkReducer,
    reducerTypes.REMOVE_DOCUMENT_FROM_VARIANCE
  ),
  [reducerTypes.GET_CORE_USERS]: createReducer(networkReducer, reducerTypes.GET_CORE_USERS),
  [reducerTypes.GET_VARIANCE_STATUS_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_VARIANCE_STATUS_OPTIONS
  ),
  [reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS
  ),
  [reducerTypes.GET_NOTICE_OF_WORK_APPLICATION]: createReducer(
    networkReducer,
    reducerTypes.GET_NOTICE_OF_WORK_APPLICATION
  ),
  [reducerTypes.GET_MINE_NOTICE_OF_WORK_APPLICATIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_NOTICE_OF_WORK_APPLICATIONS
  ),
  [reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION]: createReducer(
    networkReducer,
    reducerTypes.CREATE_NOTICE_OF_WORK_APPLICATION
  ),
  [reducerTypes.GET_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS]: createReducer(
    networkReducer,
    reducerTypes.GET_NOTICE_OF_WORK_ACTIVITY_TYPE_OPTIONS
  ),
};

export const rootReducer = combineReducers(reducerObject);
