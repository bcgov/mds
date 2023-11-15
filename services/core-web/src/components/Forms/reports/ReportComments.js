import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getMineReportComments } from "@mds/common/redux/selectors/reportSelectors";
import {
  fetchMineReportComments,
  createMineReportComment,
  deleteMineReportComment,
} from "@mds/common/redux/actionCreators/reportCommentActionCreator";
import CommentPanel from "@/components/common/comments/CommentPanel";
import FormItemLabel from "@/components/common/FormItemLabel";

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
  !latest && <span>Comment refers to a previous submission</span>,
  visible && <span>Comment published to Minespace</span>,
];

export class ReportComments extends Component {
  state = { loading: true };

  componentDidMount() {
    this.fetchComments();
  }

  handleRemoveComment = (commentGuid) => {
    return this.props
      .deleteMineReportComment(this.props.mineGuid, this.props.mineReportGuid, commentGuid)
      .then(() => this.fetchComments());
  };

  handleAddComment = async (values) => {
    const formValues = {
      report_comment: values.comment,
      comment_visibility_ind: values.visible,
    };
    return this.props
      .createMineReportComment(this.props.mineGuid, this.props.mineReportGuid, formValues)
      .then(() => {
        this.fetchComments();
      });
  };

  fetchComments() {
    this.setState({ loading: true });
    this.props
      .fetchMineReportComments(this.props.mineGuid, this.props.mineReportGuid)
      .then(() => this.setState({ loading: false }));
  }

  render() {
    return (
      <React.Fragment>
        <FormItemLabel underline>Comments</FormItemLabel>
        <CommentPanel
          renderEditor
          onSubmit={this.handleAddComment}
          loading={this.state.loading}
          onRemove={this.handleRemoveComment}
          comments={this.props.mineReportComments.map((comment) => ({
            key: comment.mine_report_comment_guid,
            author: comment.comment_user,
            content: comment.report_comment,
            actions: actionBuilder(comment.comment_visibility_ind, comment.from_latest_submission),
            datetime: comment.comment_datetime,
          }))}
        />
      </React.Fragment>
    );
  }
}

ReportComments.propTypes = propTypes;
ReportComments.defaultProps = defaultProps;

const mapStateToProps = (state) => ({
  mineReportComments: getMineReportComments(state),
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

export default connect(mapStateToProps, mapDispatchToProps)(ReportComments);
