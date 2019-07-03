import { PropTypes } from "prop-types";

export const mineReport = PropTypes.shape({
  report_name: PropTypes.string,
  due_date: PropTypes.string,
  submissions: PropTypes.arrayOf(mineReportSubmission),
});

export const mineReportSubmission = PropTypes.shape({
  received_date: PropTypes.string,
  documents: PropTypes.arrayOf(mineReportSubmissionDocument),
});

export const mineReportSubmissionDocument = PropTypes.shape({
  document_name: PropTypes.string,
  mine_document_guid: PropTypes.string,
});
