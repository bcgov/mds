import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Icon, Button } from "antd";
import LinkButton from "@/components/common/LinkButton";
import { getMineReportDefinitionOptions } from "@/selectors/staticContentSelectors";
import ReportHistorySubmissionSummary from "@/components/Forms/reports/ReportHistorySubmissionSummary";

const propTypes = {
  toggleReportHistory: PropTypes.func.isRequired,
  submissionYear: PropTypes.number.isRequired,
  mineReportDefinitionGuid: PropTypes.string.isRequired,
  mineReportDefinitionOptions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)).isRequired,
};

export const ReportHistory = (props) => (
  <div>
    <h4>
      {`File History for ${props.submissionYear} ${
        props.mineReportDefinitionOptions.filter(
          (rd) => rd.mine_report_definition_guid === props.mineReportDefinitionGuid
        )[0].report_name
      }`}
    </h4>
    <LinkButton onClick={props.toggleReportHistory}>
      <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
      Back to Report
    </LinkButton>
    <div className="padding-xxl--top" />
    {props.mineReportSubmissions.map((submission) => (
      <ReportHistorySubmissionSummary mineReportSubmission={submission} />
    ))}
    <div className="center">
      <Button onClick={props.toggleReportHistory}>OK</Button>
    </div>
  </div>
);

ReportHistory.propTypes = propTypes;

const mapStateToProps = (state) => ({
  mineReportDefinitionOptions: getMineReportDefinitionOptions(state),
});

export default connect(mapStateToProps)(ReportHistory);
