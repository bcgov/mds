import { PropTypes, shape, arrayOf } from "prop-types";

export const permitAmendment = shape({
  permit_amendment_id: PropTypes.number,
  permit_amendment_guid: PropTypes.string,
  permit_amendment_status_code: PropTypes.string,
  permit_amendment_type_code: PropTypes.string,
  received_date: PropTypes.string,
  issue_date: PropTypes.string,
  authorization_end_date: PropTypes.string,
});

export const permit = shape({
  permit_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  permit_no: PropTypes.string,
  permit_status_code: PropTypes.string,
  amendments: arrayOf(permitAmendment),
});
