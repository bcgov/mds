import * as partiesReducer from "@/reducers/partiesReducer";
import { createSelector } from "reselect";
import { createLabelHash } from "@/utils/helpers";

export const {
  getParties,
  getRawParties,
  getPartyIds,
  getPartyRelationships,
  getPartyPageData,
  getAddPartyFormState,
  getLastCreatedParty,
  getInspectors,
} = partiesReducer;

export const getSummaryPartyRelationships = createSelector(
  [getPartyRelationships],
  (partyRelationships) =>
    partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code))
);

export const getDropdownInspectors = createSelector(
  [getInspectors],
  (parties) => parties.map((party) => ({ value: party.party_guid, label: party.name }))
);

export const getInspectorsHash = createSelector(
  [getDropdownInspectors],
  createLabelHash
);
