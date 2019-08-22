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
  records: PropTypes.arrayOf(variance),
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  total: PropTypes.number,
  total_pages: PropTypes.number,
});

export const varianceSearchInitialValues = shape({
  region: PropTypes.arrayOf(PropTypes.string),
  compliance_code: PropTypes.arrayOf(PropTypes.string),
  major: PropTypes.string,
  issue_date_after: PropTypes.string,
  issue_date_before: PropTypes.string,
  expiry_date_before: PropTypes.string,
  expiry_date_after: PropTypes.string,
});

export default variance;
