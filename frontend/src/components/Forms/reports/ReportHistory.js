import React from "react";
import PropTypes from "prop-types";
import { Icon, Divider } from "antd";
import LinkButton from "@/components/common/LinkButton";

const propTypes = {
  toggleReportHistory: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

const defaultProps = {};

export const ReportHistory = (props) => {
  return (
    <div>
      <h2>File History for ...</h2>
      <LinkButton onClick={props.toggleReportHistory}>
        <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
        Back to Edit Report
      </LinkButton>
      <Divider />
      {props.mineReportSubmissions.map((submission) => (
        <div>
          <h5>{submission.submission_date}</h5>
          {submission.mine_report_submission_status_code}
          <br />
          {submission.mine_report_submission_guid}
          <br />
          {submission.documents.map((document) => (
            <div>
              {document.document_name}
              <br />
            </div>
          ))}
          <br />
          <br />
        </div>
      ))}
    </div>
  );
};

export default ReportHistory;
