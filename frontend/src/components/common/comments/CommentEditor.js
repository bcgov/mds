import React, { Component } from "react";
import PropTypes from "prop-types";
import { Comment, Form, Button, Input } from "antd";

const { TextArea, Checkbox } = Input;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  submitting: PropTypes.bool,
  value: PropTypes.string,
  checkbox: PropTypes.bool,
};

const defaultProps = {
  onChange: () => {},
  submitting: false,
  value: "",
  checkbox: false,
};

export class CommentEditor extends Component {
  handleSubmit = () => {
    // this.props.onSubmit();
    // this.props.onSubmit({props.value, props.checkbox})
  };

  render() {
    return (
      // <Comment>
      <div>
        <Form.Item>
          <TextArea rows={4} value={this.props.value} />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={this.props.checkbox}>
            Publish this comment on MineSpace for the proponent to see
          </Checkbox>
        </Form.Item>
        <Button
          htmlType="submit"
          loading={this.props.submitting}
          onClick={this.handleSubmit}
          type="primary"
        >
          Add Comment
        </Button>
      </div>
      // </Comment> }
    );
  }
}

CommentEditor.propTypes = propTypes;
CommentEditor.defaultProps = defaultProps;

export default CommentEditor;
