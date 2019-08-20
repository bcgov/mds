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
  report_name: PropTypes.string,
  due_date: PropTypes.string,
  received_date: PropTypes.string,
  mine_report_submissions: PropTypes.arrayOf(mineReportSubmission),
});
