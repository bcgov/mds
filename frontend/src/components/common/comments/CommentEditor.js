import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input, Form, Button, Checkbox } from "antd";

const { TextArea } = Input;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
};

const defaultProps = {
  submitting: false,
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
    return (
      <div>
        <Form.Item>
          <TextArea
            rows={4}
            onChange={this.handleChange}
            value={this.state.comment}
            name="comment"
          />
        </Form.Item>
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
        <Button
          disabled={this.state.comment === ""}
          htmlType="button"
          loading={this.state.submitting}
          onClick={this.handleSubmit}
          type="primary"
        >
          Add Comment
        </Button>
      </div>
    );
  }
}

CommentEditor.propTypes = propTypes;
CommentEditor.defaultProps = defaultProps;

export default CommentEditor;
