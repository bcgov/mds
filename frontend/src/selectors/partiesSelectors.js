import * as partiesReducer from "@/reducers/partiesReducer";
import { createSelector } from "reselect";
import { createLabelHash } from "@/utils/helpers";

export const {
  getParties,
  getRawParties,
  getPartyIds,
  getPartyRelationshipTypes,
  getPartyRelationshipTypesList,
  getPartyRelationships,
  getPartyPageData,
} = partiesReducer;

export const getSummaryPartyRelationships = createSelector(
  [getPartyRelationships],
  (partyRelationships) =>
    partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code))
);

export const getPartyRelationshipTypeHash = createSelector(
  [getPartyRelationshipTypesList],
  createLabelHash
);
