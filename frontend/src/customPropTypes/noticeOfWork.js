import { PropTypes, shape } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const nowApplication = shape({
  application_guid: PropTypes.string.isRequired,
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
  minenumber: PropTypes.string,
  noticeofworktype: PropTypes.string,
  trackingnumber: PropTypes.number,
  status: PropTypes.string,
  receiveddate: PropTypes.string,
});
