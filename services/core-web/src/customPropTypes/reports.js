import { PropTypes } from "prop-types";

export const mineReportSubmissionDocument = PropTypes.shape({
  document_name: PropTypes.string,
  mine_document_guid: PropTypes.string,
});

export const mineReportSubmission = PropTypes.shape({
  received_date: PropTypes.string,
  documents: PropTypes.arrayOf(mineReportSubmissionDocument),
});

export const mineReport = PropTypes.shape({
  mine_report_id: PropTypes.string,
  mine_report_guid: PropTypes.string,
  mine_report_definition_guid: PropTypes.string,
  mine_report_category: PropTypes.arrayOf(PropTypes.string),
  report_name: PropTypes.string,
  due_date: PropTypes.string,
  received_date: PropTypes.string,
  submission_year: PropTypes.number,
  created_by_idir: PropTypes.string,
  permit_guid: PropTypes.string,
  mine_report_submissions: PropTypes.arrayOf(mineReportSubmission),
  mine_guid: PropTypes.string,
  mine_name: PropTypes.string,
});

export const reportPageData = PropTypes.shape({
  records: PropTypes.arrayOf(mineReport),
  current_page: PropTypes.number,
  items_per_page: PropTypes.number,
  total: PropTypes.number,
  total_pages: PropTypes.number,
});
