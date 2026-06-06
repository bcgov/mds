import {
  IPermit,
  IPermitAmendment,
  IPermitCondition,
  IStandardPermitCondition,
} from "@mds/common/interfaces";
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
  latestPermitAmendments: Record<string, IPermitAmendment>;
  permitAmendments: Record<string, IPermitAmendment>;
}

const initialState = {
  permits: [],
  draftPermits: [],
  permitConditions: [],
  editingConditionFlag: false,
  editingPreambleFlag: false,
  standardPermitConditions: [],
  latestPermitAmendments: {},
  permitAmendments: {},
};

const shallowEqual = (a: Record<string, any>, b: Record<string, any>): boolean =>
  Object.keys(a).length === Object.keys(b).length &&
  Object.keys(a).every((k) => a[k] === b[k]);

const updateChangedConditions = (incoming: IPermitCondition[], existing: IPermitCondition[]): IPermitCondition[] => {
  const existingById = Object.fromEntries(existing.map((condition) => [condition.permit_condition_id, condition]));
  const updatedConditions = incoming.map((incomingCondition) => {
    const existingCondition = existingById[incomingCondition.permit_condition_id];
    if (!existingCondition) {
      return incomingCondition;
    }

    const sub_conditions = updateChangedConditions(incomingCondition.sub_conditions ?? [], existingCondition.sub_conditions ?? []);
    const candidate = { ...incomingCondition, sub_conditions };
    return shallowEqual(candidate, existingCondition) ? existingCondition : candidate;
  });

  return updatedConditions.length === existing.length && updatedConditions.every((condition, index) => condition === existing[index]) ? existing : updatedConditions;
};

export const permitReducer = (state: PermitState = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PERMITS:
      const amendments: Record<string, IPermitAmendment> = action.payload.records.reduce(
        (acc, permit) => {
          const latestAmendment = permit.permit_amendments.filter(
            (a) => a.permit_amendment_status_code !== "DFT"
          )[0];

          if (latestAmendment) {
            acc[permit.permit_guid] = latestAmendment;
          }
          return acc;
        },
        {}
      );

      return {
        ...state,
        permits: action.payload.records,
        latestPermitAmendments: {
          ...state.latestPermitAmendments,
          ...amendments,
        },
      };
    case actionTypes.STORE_PERMIT_CONDITION_CATEGORY:
      const { permitGuid, condition_categories } = action.payload;
      const permit = state.latestPermitAmendments[permitGuid];

      return {
        ...state,
        latestPermitAmendments: {
          ...state.latestPermitAmendments,
          [permitGuid]: {
            ...permit,
            condition_categories: [...condition_categories],
          },
        },
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
    case actionTypes.STORE_PERMIT_AMENDMENT:
      const { permit_guid, permit_amendment_guid } = action.payload;

      const allPermits = state.permits;
      const permit_index = allPermits.findIndex((p) => p.permit_guid === permit_guid);

      // update the amendment in the permits state if it's there
      if (permit_index !== -1) {
        const newPermit = allPermits[permit_index];
        const amendment_index = newPermit.permit_amendments.findIndex(
          (a) => a.permit_amendment_guid === permit_amendment_guid
        );
        newPermit.permit_amendments[amendment_index] = action.payload;
        allPermits[permit_index] = newPermit;
      }

      // add it to latestAmendments if it is a latestAmendment
      const isInLatestAmendments = Boolean(state.latestPermitAmendments[permit_amendment_guid]);

      return {
        ...state,
        permits: allPermits,
        permitAmendments: { ...state.permitAmendments, [permit_amendment_guid]: action.payload },
        latestPermitAmendments: isInLatestAmendments
          ? { ...state.latestPermitAmendments, [permit_amendment_guid]: action.payload }
          : state.latestPermitAmendments,
      };
    case actionTypes.STORE_STANDARD_PERMIT_CONDITIONS:
      return {
        ...state,
        standardPermitConditions: action.payload.records,
      };
    case actionTypes.STORE_PERMIT_AMENDMENT_CONDITIONS: {
      const { permit_guid, permit_amendment_guid, ...amendmentFields } = action.payload;
      const updateMatchingAmendment = (permitAmendment) => {
        if (permitAmendment.permit_amendment_guid !== permit_amendment_guid) {
          return permitAmendment;
        }

        return {
          ...permitAmendment,
          ...amendmentFields,
          conditions: updateChangedConditions(amendmentFields.conditions ?? [],
            permitAmendment.conditions ?? [])
        };
      };
      return {
        ...state,
        permits: state.permits.map((permit) =>
            permit.permit_guid === permit_guid
              ? { ...permit, permit_amendments: permit.permit_amendments.map(updateMatchingAmendment) }
              : permit
          ),
      };
    }
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
export const getLatestPermitAmendments = (state: RootState): IPermitAmendment[] =>
  state[PERMITS].latestPermitAmendments;
export const getPermitAmendments = (state: RootState): Record<string, IPermitAmendment> =>
  state[PERMITS].permitAmendments;
export const getPermitConditions = (state: RootState): IPermitCondition[] =>
  state[PERMITS].permitConditions;
export const getStandardPermitConditions = (state: RootState): IStandardPermitCondition[] =>
  state[PERMITS].standardPermitConditions;
export const getEditingConditionFlag = (state: RootState): boolean =>
  state[PERMITS].editingConditionFlag;
export const getEditingPreambleFlag = (state: RootState): boolean =>
  state[PERMITS].editingPreambleFlag;

export default permitReducerObject;
