import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { getMineComments } from "@common/selectors/mineSelectors";
import {
  deleteMineComment,
  createMineComment,
  fetchMineComments,
} from "@common/actionCreators/mineActionCreator";
import CommentPanel from "@/components/common/comments/CommentPanel";

const propTypes = {
  mineGuid: PropTypes.string.isRequired,
  comments: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.any)),
  deleteMineComment: PropTypes.func.isRequired,
  createMineComment: PropTypes.func.isRequired,
  fetchMineComments: PropTypes.func.isRequired,
};

const defaultProps = {
  comments: [],
};

// const actionBuilder = (visible, latest) => [
//   !latest && <span>Comment refers to a previous submission</span>,
//   visible && <span>Comment published to Minespace</span>,
// ];

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
        <CommentPanel
          hideTitle
          renderAdd
          onSubmit={this.handleAddComment}
          loading={this.state.loading}
          s
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
MineComments.defaultProps = defaultProps;

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
