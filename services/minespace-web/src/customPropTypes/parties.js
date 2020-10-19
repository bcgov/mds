import { PropTypes, shape } from "prop-types";

export const party = shape({
  party_guid: PropTypes.string,
  party_type_code: PropTypes.string,
  phone_no: PropTypes.string,
  phone_ext: PropTypes.any,
  email: PropTypes.string,
  party_name: PropTypes.string,
  name: PropTypes.string,
  first_name: PropTypes.string,
});

export const partyRelationship = shape({
  mine_party_appt_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  party,
  mine_party_appt_type_code: PropTypes.string,
  related_guid: PropTypes.string,
  start_date: PropTypes.string,
  end_date: PropTypes.string,
});

export const partyRelationshipType = shape({
  active_ind: PropTypes.bool.isRequired,
  description: PropTypes.string.isRequired,
  display_order: PropTypes.number.isRequired,
  grouping_level: PropTypes.number.isRequired,
  mine_party_appt_type_code: PropTypes.string.isRequired,
  organization: PropTypes.bool.isRequired,
  person: PropTypes.bool.isRequired,
});

export const partyPageData = shape({
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  parties: PropTypes.arrayOf(party),
  total: PropTypes.number,
  total_pages: PropTypes.number,
});
