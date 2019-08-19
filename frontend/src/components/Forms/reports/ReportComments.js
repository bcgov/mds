import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Divider } from "antd";
import { formatDateTime } from "@/utils/helpers";

import CommentPanel from "@/components/common/comments/CommentPanel";
import {
  getMineReportComments,
  getMineReportCommentLoading,
  getMineReportCommentSubmitting,
} from "@/selectors/reportSelectors";

import {
  fetchMineReportComments,
  createMineReportComment,
  deleteMineReportComment,
} from "@/actionCreators/reportCommentActionCreator";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  mineReportGuid: PropTypes.string.isRequired,
  mineReportComments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  fetchMineReportComments: PropTypes.func.isRequired,
  createMineReportComment: PropTypes.func.isRequired,
  deleteMineReportComment: PropTypes.func.isRequired,
};

const defaultProps = {
  mineReportComments: [],
};

const actionBuilder = (visible, latest) => [
  visible && <span>Comment published to Minespace</span>,
  !latest && <span>Comment refers to a previous submission</span>,
];

export class ReportComments extends Component {
  componentDidMount() {
    this.props.fetchMineReportComments(this.props.mineGuid, this.props.mineReportGuid);
  }

  handleRemoveComment = (commentGuid) => {
    this.props
      .deleteMineReportComment(this.props.mineGuid, this.props.mineReportGuid, commentGuid)
      .then(() =>
        this.props.fetchMineReportComments(this.props.mineGuid, this.props.mineReportGuid)
      );
  };

  handleAddComment = async (values) => {
    const formValues = {
      report_comment: values.comment,
      comment_visibility_ind: values.visible,
    };
    return this.props
      .createMineReportComment(this.props.mineGuid, this.props.mineReportGuid, formValues)
      .then(() =>
        this.props.fetchMineReportComments(this.props.mineGuid, this.props.mineReportGuid)
      );
  };

  render() {
    return [
      <Divider orientation="left">
        <h5>Comments</h5>
      </Divider>,
      <CommentPanel
        renderAdd
        onSubmit={this.handleAddComment}
        submitting={this.commentSubmitting}
        loading={this.commentLoading}
        onRemove={this.handleRemoveComment}
        comments={this.props.mineReportComments.map((comment) => ({
          key: comment.mine_report_comment_guid,
          author: comment.comment_user,
          content: comment.report_comment,
          actions: actionBuilder(comment.comment_visibility_ind, comment.from_latest_submission),
          datetime: formatDateTime(comment.comment_datetime),
        }))}
      />,
    ];
  }
}

ReportComments.propTypes = propTypes;
ReportComments.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportComments: getMineReportComments(state),
  commentSubmitting: getMineReportCommentSubmitting(state),
  commentLoading: getMineReportCommentLoading(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      fetchMineReportComments,
      createMineReportComment,
      deleteMineReportComment,
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReportComments);
