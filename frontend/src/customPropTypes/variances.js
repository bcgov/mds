import { PropTypes, shape } from "prop-types";

export const variance = shape({
  variance_id: PropTypes.string,
  compliance_article_id: PropTypes.int,
  expiry_date: PropTypes.string,
  issue_date: PropTypes.string,
  note: PropTypes.string,
  received_date: PropTypes.string,
});

export default variance;
