import { IPermit, IPermitAmendment, IPermitCondition, IStandardPermitCondition } from "@mds/common/interfaces";
import * as actionTypes from "@mds/common/constants/actionTypes";
import { PERMITS } from "@mds/common/constants/reducerTypes";
import { RootState } from "@mds/common/redux/rootState";

interface PermitState {
  permits: IPermit[];
  draftPermits: IPermit[];
  permitConditions: IPermitCondition[];
  editingConditionFlag: boolean;
  editingPreambleFlag: boolean;
  standardPermitConditions: IStandardPermitCondition[];
  permitAmendments: Record<string, IPermitAmendment>;
}

const initialState = {
  permits: [],
  draftPermits: [],
  permitConditions: [],
  editingConditionFlag: false,
  editingPreambleFlag: false,
  standardPermitConditions: [],
  permitAmendments: {},
};

export const permitReducer = (state: PermitState = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMITS:
      const amendments: IPermitAmendment[] = action.payload.records.reduce((acc, permit) => {
        const latestAmendment = permit.permit_amendments
          .filter(a => a.permit_amendment_status_code !== 'DFT')[0];

        if (latestAmendment) {
          acc[permit.permit_guid] = latestAmendment;
        }
        return acc;
      }, {});


      return {
        ...state,
        permits: action.payload.records,
        permitAmendments: {
          ...(state.permitAmendments),
          ...amendments
        }
      };
    case actionTypes.STORE_PERMIT_CONDITION_CATEGORY:
      const { permitGuid, condition_categories } = action.payload;
      const permit = state.permitAmendments[permitGuid];

      return {
        ...state,
        permitAmendments: {
          ...state.permitAmendments,
          [permitGuid]: {
            ...permit,
            condition_categories: [...condition_categories]
          }
        }
      };
    case actionTypes.STORE_DRAFT_PERMITS:
      return {
        ...state,
        draftPermits: action.payload.records,
      };
    case actionTypes.STORE_PERMIT_CONDITIONS:
      return {
        ...state,
        permitConditions: action.payload.records,
      };
    case actionTypes.STORE_STANDARD_PERMIT_CONDITIONS:
      return {
        ...state,
        standardPermitConditions: action.payload.records,
      };
    case actionTypes.STORE_EDITING_CONDITION_FLAG:
      return {
        ...state,
        editingConditionFlag: action.payload,
      };
    case actionTypes.STORE_EDITING_PREAMBLE_FLAG:
      return {
        ...state,
        editingPreambleFlag: action.payload,
      };
    default:
      return state;
  }
};

const permitReducerObject = {
  [PERMITS]: permitReducer,
};

export const getUnformattedPermits = (state: RootState): IPermit[] => state[PERMITS].permits;
export const getDraftPermits = (state: RootState): IPermit[] => state[PERMITS].draftPermits;
export const getLatestPermitAmendments = (state: RootState): IPermitAmendment[] => state[PERMITS].permitAmendments;
export const getPermitConditions = (state: RootState): IPermitCondition[] =>
  state[PERMITS].permitConditions;
export const getStandardPermitConditions = (state: RootState): IStandardPermitCondition[] =>
  state[PERMITS].standardPermitConditions;
export const getEditingConditionFlag = (state: RootState): boolean =>
  state[PERMITS].editingConditionFlag;
export const getEditingPreambleFlag = (state: RootState): boolean =>
  state[PERMITS].editingPreambleFlag;


export default permitReducerObject;
