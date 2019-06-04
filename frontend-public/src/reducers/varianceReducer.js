import * as actionTypes from "@/constants/actionTypes";
import { VARIANCES } from "@/constants/reducerTypes";

const initialState = {
  mineVariances: [],
  complianceCodes: [],
  varianceStatusOptions: [],
  variance: {},
};

const varianceReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_VARIANCES:
      return {
        ...state,
        mineVariances: action.payload.records,
      };
    case actionTypes.STORE_VARIANCE:
      return {
        ...state,
        variance: action.payload,
      };
    case actionTypes.STORE_COMPLIANCE_CODES:
      return {
        ...state,
        complianceCodes: action.payload.records,
      };
    case actionTypes.STORE_VARIANCE_STATUS_OPTIONS:
      return {
        ...state,
        varianceStatusOptions: action.payload.records,
      };
    default:
      return state;
  }
};

export const getMineVariances = (state) => state[VARIANCES].mineVariances;
export const getVariance = (state) => state[VARIANCES].variance;
export const getComplianceCodes = (state) => state[VARIANCES].complianceCodes;
export const getIncidentFollowupActionOptions = (state) =>
  state[VARIANCES].incidentFollowupActionOptions;
export const getVarianceStatusOptions = (state) => state[VARIANCES].varianceStatusOptions;

export default varianceReducer;
