import React, { Component } from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Input, Button, Checkbox } from "antd";
import { getUserAccessData } from "@mds/common/redux/selectors/authenticationSelectors";
import { USER_ROLES } from "@mds/common";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
  submitting: PropTypes.bool,
  addCommentPermission: PropTypes.string,
};

const defaultProps = {
  submitting: false,
  addCommentPermission: null,
};

export class CommentEditor extends Component {
  initialState = { comment: "", visible: false, submitting: false };

  constructor(props) {
    super(props);
    this.state = this.initialState;
  }

  handleReset = () => {
    this.setState(this.initialState);
  };

  handleSubmit = (event) => {
    event.preventDefault();
    this.setState({ submitting: true });
    this.props.onSubmit({ comment: this.state.comment, visible: this.state.visible }).then(() => {
      this.handleReset();
    });
  };

  handleChange = (e) => this.setState({ [e.target.name]: e.target.value });

  handleCheckboxChange = (e) => {
    this.setState({ [e.target.name]: e.target.checked });
  };

  validate = () => !(this.props.submitting || this.state.comment === "");

  render() {
    const canAddComment = this.props.addCommentPermission
      ? this.props.userRoles.includes(USER_ROLES[this.props.addCommentPermission])
      : true;

    return (
      <div>
        {canAddComment && (
          <Form.Item>
            <Input.TextArea
              rows={4}
              placeholder="Enter your comment here"
              showCount
              maxLength={100}
              onChange={this.handleChange}
              value={this.state.comment}
              name="comment"
            />
          </Form.Item>
        )}
        {// TODO: Hide until Minespace is updated to display comments.
        false && (
          <Form.Item>
            <Checkbox
              name="visible"
              checked={this.state.visible}
              onChange={this.handleCheckboxChange}
            >
              Publish this comment on MineSpace for the proponent to see
            </Checkbox>
          </Form.Item>
        )}
        {canAddComment && (
          <Button
            disabled={this.state.comment === ""}
            htmlType="button"
            loading={this.state.submitting}
            onClick={this.handleSubmit}
            type="primary"
          >
            Add Comment
          </Button>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  userRoles: getUserAccessData(state),
});

CommentEditor.propTypes = propTypes;
CommentEditor.defaultProps = defaultProps;

export default connect(mapStateToProps)(CommentEditor);
