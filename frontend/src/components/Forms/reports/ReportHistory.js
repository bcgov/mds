import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Button } from "antd";
import { getMineReportDefinitionOptions } from "@/selectors/staticContentSelectors";
import ReportHistorySubmissionSummary from "@/components/Forms/reports/ReportHistorySubmissionSummary";

const propTypes = {
  hideReportHistory: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

export const ReportHistory = (props) => (
  <div>
    {props.mineReportSubmissions.map((submission) => (
      <ReportHistorySubmissionSummary
        key={submission.mine_report_submission_guid}
        mineReportSubmission={submission}
      />
    ))}
    <div className="center">
      <Button onClick={props.hideReportHistory}>OK</Button>
    </div>
  </div>
);

ReportHistory.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

export default connect(mapStateToProps)(ReportHistory);
