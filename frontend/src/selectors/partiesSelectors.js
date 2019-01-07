import * as partiesReducer from "@/reducers/partiesReducer";
import { createSelector } from "reselect";

export const {
  getParties,
  getPartyIds,
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
  getPartyRelationships,
} = partiesReducer;

export const getPartyRelationshipsByTypes = createSelector(
  [getPartyRelationships],
  (partyRelationships, types) => {
    return partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code));
  }
);
