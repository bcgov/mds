import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getMineComments } from "@mds/common/redux/selectors/mineSelectors";
import {
  deleteMineComment,
  createMineComment,
  fetchMineComments,
} from "@mds/common/redux/actionCreators/mineActionCreator";
import CommentPanel from "@/components/common/comments/CommentPanel";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  comments: PropTypes.arrayOf(CustomPropTypes.mineComment).isRequired,
  deleteMineComment: PropTypes.func.isRequired,
  createMineComment: PropTypes.func.isRequired,
  fetchMineComments: PropTypes.func.isRequired,
};

export class MineComments extends Component {
  state = { loading: true };

  componentDidMount() {
    this.fetchComments();
  }

  handleRemoveComment = (commentGuid) => {
    this.props.deleteMineComment(this.props.mineGuid, commentGuid).then(() => this.fetchComments());
  };

  handleAddComment = async (values) => {
    const formValues = {
      mine_comment: values.comment,
    };
    return this.props.createMineComment(this.props.mineGuid, formValues).then(() => {
      this.fetchComments();
    });
  };

  fetchComments() {
    this.setState({ loading: true });
    this.props.fetchMineComments(this.props.mineGuid).then(() => this.setState({ loading: false }));
  }

  render() {
    return (
      <div>
        <span className="ant-comment-content-author-time inline-flex flex-center">
          Message history is only shown for one year
        </span>
        <CommentPanel
          renderEditor
          onSubmit={this.handleAddComment}
          loading={this.state.loading}
          onRemove={this.handleRemoveComment}
          comments={this.props.comments.map((comment) => ({
            key: comment.mine_comment_guid,
            author: comment.comment_user,
            content: comment.mine_comment,
            actions: null,
            datetime: comment.comment_datetime,
          }))}
        />
      </div>
    );
  }
}

MineComments.propTypes = propTypes;

const mapStateToProps = (state) => ({
  comments: getMineComments(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      deleteMineComment,
      createMineComment,
      fetchMineComments,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(MineComments);
