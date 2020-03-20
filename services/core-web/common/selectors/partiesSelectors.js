import { createSelector } from "reselect";
import moment from "moment";
import * as partiesReducer from "../reducers/partiesReducer";
import { createLabelHash } from "../utils/helpers";

export const {
  getParties,
  getRawParties,
  getPartyIds,
  getPartyRelationships,
  getPartyPageData,
  getAddPartyFormState,
  getLastCreatedParty,
  getInspectors,
  getInspectorsList,
} = partiesReducer;

export const getSummaryPartyRelationships = createSelector(
  [getPartyRelationships],
  (partyRelationships) =>
    partyRelationships.filter((pr) => ["MMG", "PMT"].includes(pr.mine_party_appt_type_code))
);

export const getDropdownInspectors = createSelector([getInspectors], (parties) => {
  const activeInspectors = parties
    .filter(
      (inspector) => moment(inspector.expiry_date) >= moment() || inspector.expiry_date === null
    )
    .map((inspector) => ({
      value: inspector.party_guid,
      label: inspector.name,
    }));
  const inactiveInspectors = parties
    .filter((inspector) => moment(inspector.expiry_date) < moment())
    .map((inspector) => ({
      value: inspector.party_guid,
      label: inspector.name,
    }));
  return [
    { groupName: "Active", opt: activeInspectors },
    { groupName: "Inactive", opt: inactiveInspectors },
  ];
});

export const getInspectorsHash = createSelector([getInspectorsList], createLabelHash);
