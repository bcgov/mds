import React from "react";
import PropTypes from "prop-types";
import { Icon, Divider, Button } from "antd";
import LinkButton from "@/components/common/LinkButton";
import CommentPanel from "@/components/common/comments/CommentPanel";
import { formatDateTime } from "@/utils/helpers";

const propTypes = {
  toggleReportHistory: PropTypes.func.isRequired,
  mineReportSubmissions: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
};

const defaultProps = {};

const actionBuilder = (visible) => [visible && <span>Comment published to Minespace</span>];

export const ReportHistory = (props) => {
  return (
    <div>
      <h2>File History for ...</h2>
      <LinkButton onClick={props.toggleReportHistory}>
        <Icon type="arrow-left" style={{ paddingRight: "5px" }} />
        Back to Report
      </LinkButton>
      <Divider />
      {props.mineReportSubmissions.map((submission) => (
        <div>
          <h5>{submission.submission_date}</h5>
          <Divider />
          {submission.mine_report_submission_status_code}
          <br />
          {submission.mine_report_submission_guid}
          <br />
          <CommentPanel
            renderAdd={false}
            comments={submission.comments.map((comment) => ({
              key: comment.mine_report_comment_guid,
              author: comment.comment_user,
              content: comment.report_comment,
              actions: actionBuilder(comment.comment_visibility_ind),
              datetime: formatDateTime(comment.comment_datetime),
            }))}
          />
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
      <div className="center">
        <Button onClick={props.toggleReportHistory}>OK</Button>
      </div>
    </div>
  );
};

export default ReportHistory;
