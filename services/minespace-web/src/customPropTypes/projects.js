import { PropTypes, shape } from "prop-types";
import { mineDocument } from "@/customPropTypes/documents";

export const projectSummary = shape({
  project_summary_id: PropTypes.number,
  project_summary_guid: PropTypes.string,
  status_code: PropTypes.string,
  submission_date: PropTypes.string,
  project_summary_description: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export const informationRequirementsTable = shape({
  information_requirements_table_id: PropTypes.number,
  information_requirements_table_guid: PropTypes.string,
  status_code: PropTypes.string,
  create_timestamp: PropTypes.string,
});

export const project = shape({
  project_id: PropTypes.number,
  project_guid: PropTypes.string,
  mine_guid: PropTypes.string,
  project_title: PropTypes.string,
  project_summary: projectSummary,
  contacts: PropTypes.arrayOf(mineDocument),
});
