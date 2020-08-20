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

// split inspectors on active and inactive based on business role
export const getDropdownInspectors = createSelector([getInspectors], (parties) => {
  const today = moment().utc();
  const activeInspectors = parties
    .filter(
      (inspector) =>
        !!inspector.business_role_appts.find(
          (r) =>
            today.isSameOrAfter(r.start_date, "day") &&
            (today.isBefore(r.end_date, "day") || !r.end_date)
        )
    )
    .map((inspector) => ({
      value: inspector.party_guid,
      label: inspector.name,
    }));
  const inactiveInspectors = parties
    .filter(
      (inspector) =>
        !!inspector.business_role_appts.find(
          (r) =>
            today.isAfter(r.end_date, "day") &&
            !activeInspectors.find((ins) => ins.party_guid === inspector.party_guid)
        )
    )
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
