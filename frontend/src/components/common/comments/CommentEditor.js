import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input, Form, Button, Checkbox } from "antd";

const { TextArea } = Input;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onChange: PropTypes.func,
  submitting: PropTypes.bool,
};

const defaultProps = {
  onChange: () => {},
  submitting: false,
};

export class CommentEditor extends Component {
  constructor(props) {
    super(props);
    this.state = { commentText: "", checkbox: false };
  }

  handleSubmit = (event) => {
    event.preventDefault();
    this.props.onSubmit({ comment: this.state.commentText, visible: this.state.checkbox });
  };

  render() {
    return (
      <div>
        <Form.Item>
          <TextArea rows={4} value={this.state.commentText} />
        </Form.Item>
        <Form.Item>
          <Checkbox checked={this.state.checkbox}>
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
    );
  }
}

CommentEditor.propTypes = propTypes;
CommentEditor.defaultProps = defaultProps;

export default CommentEditor;
