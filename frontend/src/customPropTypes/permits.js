import { PropTypes, shape } from "prop-types";

export const permit = shape({
  authorization_end_date: PropTypes.string,
  issue_date: PropTypes.string,
  mine_guid: PropTypes.string,
  permit_guid: PropTypes.string,
  permit_no: PropTypes.string,
  permit_status_code: PropTypes.string,
  received_date: PropTypes.string,
});

export const minePermit = shape({
  permit_guid: PropTypes.string.isRequired,
  issue_date: PropTypes.string.isRequired,
  permit_no: PropTypes.string.isRequired,
  authorization_end_date: PropTypes.string.isRequired,
});
