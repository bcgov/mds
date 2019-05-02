import { PropTypes, shape } from "prop-types";
import { mineDocument } from "@/customPropTypes/documents";

export const variance = shape({
  variance_id: PropTypes.number,
  compliance_article_id: PropTypes.number,
  variance_application_status_code: PropTypes.string,
  applicant_guid: PropTypes.string,
  ohsc_ind: PropTypes.bool,
  union_ind: PropTypes.bool,
  inspector_id: PropTypes.string,
  expiry_date: PropTypes.string,
  issue_date: PropTypes.string,
  note: PropTypes.string,
  received_date: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export default variance;
