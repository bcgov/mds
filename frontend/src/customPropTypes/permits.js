import { PropTypes, shape, arrayOf } from "prop-types";

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

export const permittee = shape({
  effective_date: PropTypes.string,
  expiry_date: PropTypes.string,
  party,
  party_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  permittee_guid: PropTypes.string,
});

export const permit = shape({
  expiry_date: PropTypes.string,
  issue_date: PropTypes.string,
  mine_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  permit_no: PropTypes.string,
  permit_status_code: PropTypes.string,
  permittee: PropTypes.arrayOf(permittee),
  received_date: PropTypes.string,
});

export const minePermit = shape({
  permit_guid: PropTypes.string.isRequired,
  issue_date: PropTypes.string.isRequired,
  permit_no: PropTypes.string.isRequired,
  permittee: arrayOf(permittee),
  expiry_date: PropTypes.string.isRequired,
});

export const partyRelationship = shape({
  mine_party_appt_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  party,
  mine_party_appt_type_code: PropTypes.string,
  mine_tailings_storage_facility_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
});
