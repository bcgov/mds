import { uniqBy } from "lodash";
import * as actionTypes from "../constants/actionTypes";
import { PARTIES } from "../constants/reducerTypes";
import { createItemMap, createItemIdsArray } from "../utils/helpers";
import { RootState } from "@/App";
import { IParty, ItemMap, IPartyAppt, IPageData, IAddPartyFormState, IOption } from "@mds/common";

/**
 * @file partiesReducer.js
 * all data associated with parties is handled within this reducer.
 */

interface PartiesState {
  parties: ItemMap<IParty>;
  rawParties: IParty[];
  partyIds: string[];
  partyRelationships: IPartyAppt[];
  allPartyRelationships: IPartyAppt[];
  partyPageData: IPageData<IParty>;
  addPartyFormState: IAddPartyFormState;
  lastCreatedParty: IParty;
  inspectors: IPartyAppt[];
  projectLeads: IPartyAppt[];
  engineersOfRecordOptions: IOption[];
  engineersOfRecord: IPartyAppt[];
  qualifiedPersons: IPartyAppt[];
}

const initialState: PartiesState = {
  parties: {},
  rawParties: [],
  partyIds: [],
  partyRelationships: [],
  allPartyRelationships: [],
  partyPageData: {} as IPageData<IParty>,
  addPartyFormState: {} as IAddPartyFormState,
  lastCreatedParty: {} as IParty,
  inspectors: [],
  projectLeads: [],
  engineersOfRecordOptions: [],
  engineersOfRecord: [],
  qualifiedPersons: [],
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
      const tsfGuid = action.mine_tailings_storage_facility_guid;
      const eors = action.payload
        .filter((p) => p.mine_party_appt_type_code === "EOR")
        .map((p) => ({
          value: p.party_guid,
          label: p.party.name,
        }));

      const eorRecords = tsfGuid
        ? action.payload.filter(
            (p) => p.mine_party_appt_type_code === "EOR" && p.related_guid === tsfGuid
          )
        : [];
      const qfpRecords = tsfGuid
        ? action.payload.filter(
            (p) => p.mine_party_appt_type_code === "QFP" && p.related_guid === tsfGuid
          )
        : [];

      return {
        ...state,
        partyRelationships: action.payload,
        engineersOfRecord: tsfGuid ? eorRecords : state.engineersOfRecord,
        qualifiedPersons: tsfGuid ? qfpRecords : state.qualifiedPersons,
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

export const getParties = (state: RootState) => state[PARTIES].parties;
export const getRawParties = (state: RootState) => state[PARTIES].rawParties;
export const getPartyIds = (state: RootState) => state[PARTIES].partyIds;

export const getPartyRelationships = (state: RootState) => state[PARTIES].partyRelationships;
export const getAllPartyRelationships = (state: RootState) => state[PARTIES].allPartyRelationships;
export const getPartyPageData = (state: RootState) => state[PARTIES].partyPageData;
export const getAddPartyFormState = (state: RootState) => state[PARTIES].addPartyFormState;
export const getLastCreatedParty = (state: RootState) => state[PARTIES].lastCreatedParty;
export const getInspectors = (state: RootState) => state[PARTIES].inspectors;
export const getProjectLeads = (state: RootState) => state[PARTIES].projectLeads;
export const getEngineersOfRecordOptions = (state: RootState) =>
  state[PARTIES].engineersOfRecordOptions;
export const getEngineersOfRecord = (state: RootState) => state[PARTIES].engineersOfRecord;
export const getQualifiedPersons = (state: RootState) => state[PARTIES].qualifiedPersons;
export default partiesReducerObject;
