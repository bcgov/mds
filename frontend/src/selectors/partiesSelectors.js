import * as partiesReducer from "@/reducers/partiesReducer";
import { createSelector } from "reselect";

export const {
  getParties,
  getPartyIds,
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
  getPartyRelationships,
} = partiesReducer;

//TODO: find a way to paratmeterize this selector.
export const getSummaryPartyRelationships = createSelector(
  [getPartyRelationships],
  (partyRelationships) => {
    return partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code));
  }
);
