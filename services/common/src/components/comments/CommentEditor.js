import React, { useState } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Input, Button } from "antd";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { useSelector } from "react-redux";
import { userHasRole } from "@mds/common/redux/reducers/authenticationReducer";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  addCommentPermission: PropTypes.string,
};

const defaultProps = {
  submitting: false,
  addCommentPermission: null,
};

const CommentEditor = ({ onSubmit, addCommentPermission }) => {
  const initialState = { comment: "", visible: false, submitting: false };
  const [state, setState] = useState(initialState);

  const handleReset = () => {
    setState(initialState);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setState({ ...state, submitting: true });
    onSubmit({ comment: state.comment, visible: state.visible }).then(() => {
      handleReset();
    });
  };

  const handleChange = (e) => setState({ ...state, [e.target.name]: e.target.value });

  const canAddComment = addCommentPermission
    ? useSelector((state) => userHasRole(state, addCommentPermission))
    : true;

  return (
    <div>
      {canAddComment && (
        <Input.TextArea
          rows={4}
          placeholder="Enter your comment here"
          showCount
          maxLength={100}
          onChange={handleChange}
          value={state.comment}
          name="comment"
        />
      )}
      {canAddComment && (
        <Button
          disabled={state.comment === ""}
          htmlType="button"
          loading={state.submitting}
          onClick={handleSubmit}
          type="primary"
        >
          Add Comment
        </Button>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

CommentEditor.propTypes = propTypes;
CommentEditor.defaultProps = defaultProps;

export default connect(mapStateToProps)(CommentEditor);
