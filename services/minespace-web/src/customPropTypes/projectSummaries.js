import { PropTypes, shape } from "prop-types";
import { mineDocument } from "@/customPropTypes/documents";

export const projectSummary = shape({
  project_summary_id: PropTypes.number,
  project_summary_guid: PropTypes.string,
  status_code: PropTypes.string,
  project_summary_lead: PropTypes.string,
  submission_date: PropTypes.string,
  project_summary_description: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export default projectSummary;
