import { PropTypes, shape } from "prop-types";
import { mineDocument } from "@/customPropTypes/documents";

export const variance = shape({
  variance_guid: PropTypes.string,
  compliance_article_id: PropTypes.number,
  variance_application_status_code: PropTypes.string,
  applicant_guid: PropTypes.string,
  inspector_party_guid: PropTypes.string,
  expiry_date: PropTypes.string,
  issue_date: PropTypes.string,
  note: PropTypes.string,
  received_date: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export const variancePageData = shape({
  records: PropTypes.arrayOf(variance).isRequired,
  current_page: PropTypes.number.isRequired,
  items_per_page: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  total_pages: PropTypes.number.isRequired,
});

export default variance;
