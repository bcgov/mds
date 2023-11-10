import { createSelector } from "reselect";
import moment from "moment";
import * as partiesReducer from "../reducers/partiesReducer";
import { PARTIES } from "../constants/reducerTypes";
import { createLabelHash, createDropDownList } from "../utils/helpers";

export const {
  getParties,
  getRawParties,
  getPartyIds,
  getPartyRelationships,
  getPartyPageData,
  getAddPartyFormState,
  getLastCreatedParty,
  getInspectors,
  getProjectLeads,
  getAllPartyRelationships,
  getEngineersOfRecordOptions,
  getEngineersOfRecord,
  getQualifiedPersons,
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
    .filter((inspector) =>
      inspector.business_role_appts.find(
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
    .filter((inspector) =>
      inspector.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.end_date, "day") &&
          !activeInspectors.find((ins) => ins.value === inspector.party_guid)
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

// split project leads on active and inactive based on business role
export const getDropdownProjectLeads = createSelector([getProjectLeads], (parties) => {
  const today = moment().utc();
  const activeProjectLeads = parties
    .filter((projectLead) =>
      projectLead.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.start_date, "day") &&
          (today.isBefore(r.end_date, "day") || !r.end_date)
      )
    )
    .map((projectLead) => ({
      value: projectLead.party_guid,
      label: projectLead.name,
    }));
  const inactiveProjectLeads = parties
    .filter((projectLead) =>
      projectLead.business_role_appts.find(
        (r) =>
          today.isSameOrAfter(r.end_date, "day") &&
          !activeProjectLeads.find((prl) => prl.value === projectLead.party_guid)
      )
    )
    .map((projectLead) => ({
      value: projectLead.party_guid,
      label: projectLead.name,
    }));
  return [
    { groupName: "Active", opt: activeProjectLeads },
    { groupName: "Inactive", opt: inactiveProjectLeads },
  ];
});

export const getInspectorsList = (state) =>
  createDropDownList(state[PARTIES].inspectors, "name", "party_guid");

export const getProjectLeadsList = (state) =>
  createDropDownList(state[PARTIES].projectLeads, "name", "party_guid");

export const getInspectorsHash = createSelector([getInspectorsList], createLabelHash);
export const getProjectLeadsHash = createSelector([getProjectLeadsList], createLabelHash);
