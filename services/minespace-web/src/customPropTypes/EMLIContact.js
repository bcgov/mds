import { PropTypes, shape } from "prop-types";

export const EMLIContact = shape({
  contact_id: PropTypes.string,
  emli_contact_type_code: PropTypes.string,
  mine_region_code: PropTypes.string,
  is_major_mine: PropTypes.bool,
  is_general_contact: PropTypes.bool,
  email: PropTypes.string,
  phone_number: PropTypes.string,
  first_name: PropTypes.string,
  last_name: PropTypes.string,
  fax_number: PropTypes.string,
  mailing_address_line_1: PropTypes.string,
  mailing_address_line_2: PropTypes.string,
});

export default EMLIContact;
