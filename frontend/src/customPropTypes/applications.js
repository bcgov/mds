import { PropTypes, shape } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const application = shape({
  application_guid: PropTypes.string.isRequired,
  application_no: PropTypes.string,
  application_status_code: PropTypes.string,
  description: PropTypes.string,
  received_date: PropTypes.string,
});
