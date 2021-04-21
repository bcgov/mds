import React from "react";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { formatDate } from "@common/utils/helpers";
import FormItemLabel from "@/components/common/FormItemLabel";
import CommentPanel from "@/components/common/comments/CommentPanel";
import { UploadedDocumentsTable } from "@/components/common/UploadedDocumentTable";
import customPropTypes from "@/customPropTypes";

const propTypes = {
  mineReportSubmission: PropTypes.objectOf(PropTypes.any).isRequired,
  mineReportStatusOptions: customPropTypes.options.isRequired,
};

const actionBuilder = (visible) => [visible && <span>Comment published to Minespace</span>];

const ReportHistorySubmissionSummary = (props) => (
  <React.Fragment>
    <div className="padding-xxl--bottom">
      <h4>{formatDate(props.mineReportSubmission.submission_date)}</h4>
      <Divider style={{ margin: "0" }} />
      <FormItemLabel>Revision Status</FormItemLabel>
      <div>
        {props.mineReportStatusOptions &&
          props.mineReportStatusOptions.filter(
            (x) => x.value === props.mineReportSubmission.mine_report_submission_status_code
          )[0].label}
      </div>
      {props.mineReportSubmission.comments.length > 0 && (
        <React.Fragment>
          <FormItemLabel underline>Comments</FormItemLabel>
          <CommentPanel
            comments={props.mineReportSubmission.comments.map((comment) => ({
              key: comment.mine_report_comment_guid,
              author: comment.comment_user,
              content: comment.report_comment,
              actions: actionBuilder(comment.comment_visibility_ind),
              datetime: comment.comment_datetime,
            }))}
          />
        </React.Fragment>
      )}
      <FormItemLabel underline>Report Files</FormItemLabel>
      <UploadedDocumentsTable files={props.mineReportSubmission.documents} showRemove={false} />
    </div>
  </React.Fragment>
);

ReportHistorySubmissionSummary.propTypes = propTypes;

export default ReportHistorySubmissionSummary;
