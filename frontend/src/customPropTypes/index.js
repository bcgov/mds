// types/index.js
import { PropTypes, shape, arrayOf } from "prop-types";

export const dropdownListItem = shape({
  value: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
});

export const optionsType = arrayOf(dropdownListItem);

export const party = shape({
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

export const partyRelationship = shape({
  mine_party_appt_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  party: PropTypes.party,
  mine_party_appt_type_code: PropTypes.string,
  mine_tailings_storage_facility_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
});
