import { PropTypes } from "prop-types";
import { mineDocument } from "./documents";

export const projectSummary = PropTypes.shape({
  project_summary_id: PropTypes.number,
  project_summary_guid: PropTypes.string,
  status_code: PropTypes.string,
  documents: PropTypes.arrayOf(mineDocument),
});

export const project = PropTypes.shape({
  project_guid: PropTypes.string,
  project_title: PropTypes.string,
  mine_name: PropTypes.string,
  mine_guid: PropTypes.string,
  project_summary: projectSummary,
});
