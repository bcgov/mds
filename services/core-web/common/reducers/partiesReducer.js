import { uniqBy } from "lodash";
import * as actionTypes from "../constants/actionTypes";
import { PARTIES } from "../constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "../utils/helpers";

/**
 * @file partiesReducer.js
 * all data associated with parties is handled within this reducer.
 */

const initialState = {
  parties: [],
  rawParties: [],
  partyIds: [],
  partyRelationshipTypes: [],
  partyRelationships: [],
  allPartyRelationships: [],
  partyPageData: {},
  addPartyFormState: {},
  lastCreatedParty: {},
  inspectors: [],
  projectLeads: [],
  engineersOfRecordOptions: [],
};

export const partiesReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.STORE_PARTIES:
      return {
        ...state,
        rawParties: action.payload.records,
        parties: createItemMap(action.payload.records, "party_guid"),
        partyIds: createItemIdsArray(action.payload.records, "party_guid"),
        partyPageData: action.payload,
      };
    case actionTypes.STORE_PARTY:
      return {
        ...state,
        rawParties: [action.payload],
        parties: createItemMap([action.payload], "party_guid"),
        partyIds: createItemIdsArray([action.payload], "party_guid"),
      };
    case actionTypes.STORE_PARTY_RELATIONSHIPS:
      const eors = action.payload
        .filter((p) => p.mine_party_appt_type_code === "EOR")
        .map((p) => ({
          value: p.party_guid,
          label: p.party.name,
        }));

      const {tsf} = state;
      
      if(state.tsf) {
        const eorRecords = action.payload.filter(p => p.mine_party_appt_type_code === 'EOR' && p.related_guid === tsf.mine_tailings_storage_facility_guid);
        const qfpRecords = action.payload.filter(p => p.mine_party_appt_type_code === 'QFP' && p.related_guid === tsf.mine_tailings_storage_facility_guid);

        if(eorRecords?.length) {
          tsf.engineers_of_record = eorRecords;
        }
        if(qfpRecords?.length) {
          tsf.qualified_persons = qfpRecords;
        }
      }

      return {
        ...state,
        tsf,
        partyRelationships: action.payload,
        engineersOfRecordOptions: uniqBy(eors, "value"),
      };
    case actionTypes.STORE_ALL_PARTY_RELATIONSHIPS:
      return {
        ...state,
        allPartyRelationships: action.payload,
      };
    case actionTypes.STORE_ADD_PARTY_FORM_STATE:
      return {
        ...state,
        addPartyFormState: action.payload,
      };
    case actionTypes.STORE_LAST_CREATED_PARTY:
      return {
        ...state,
        lastCreatedParty: action.payload,
        rawParties: [action.payload],
      };
    case actionTypes.STORE_INSPECTORS:
      return {
        ...state,
        inspectors: action.payload.records,
      };
    case actionTypes.STORE_PROJECT_LEADS:
      return {
        ...state,
        projectLeads: action.payload.records,
      };
    default:
      return state;
  }
};

const partiesReducerObject = {
  [PARTIES]: partiesReducer,
};

export const getParties = (state) => state[PARTIES].parties;
export const getRawParties = (state) => state[PARTIES].rawParties;
export const getPartyIds = (state) => state[PARTIES].partyIds;

export const getPartyRelationships = (state) => state[PARTIES].partyRelationships;
export const getAllPartyRelationships = (state) => state[PARTIES].allPartyRelationships;
export const getPartyPageData = (state) => state[PARTIES].partyPageData;
export const getAddPartyFormState = (state) => state[PARTIES].addPartyFormState;
export const getLastCreatedParty = (state) => state[PARTIES].lastCreatedParty;
export const getInspectors = (state) => state[PARTIES].inspectors;
export const getProjectLeads = (state) => state[PARTIES].projectLeads;
export const getEngineersOfRecordOptions = (state) => state[PARTIES].engineersOfRecordOptions;

export default partiesReducerObject;
