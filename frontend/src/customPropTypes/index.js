// types/index.js
import PropTypes from "prop-types";

export const dropdownListItem = PropTypes.shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export const party = PropTypes.shape({
  party_guid: PropTypes.string,
  party_type_code: PropTypes.string,
  phone_no: PropTypes.string,
  phone_ext: PropTypes.any,
  email: PropTypes.string,
  effective_date: PropTypes.string,
  expiry_date: PropTypes.string,
  party_name: PropTypes.string,
  name: PropTypes.string,
  first_name: PropTypes.string,
});

export const partyRelationship = PropTypes.shape({
  mine_party_appt_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  party: PropTypes.party,
  mine_party_appt_type_code: PropTypes.string,
  mine_tailings_storage_facility_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
});
