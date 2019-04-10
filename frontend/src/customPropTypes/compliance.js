import { PropTypes, shape } from "prop-types";

// This file is anticipated to have multiple exports
// eslint-disable-next-line import/prefer-default-export
export const complianceOrder = shape({
  due_date: PropTypes.date,
  inspector: PropTypes.string,
  order_no: PropTypes.string,
  order_status: PropTypes.bool,
  report_no: PropTypes.string,
  violation: PropTypes.string,
});
