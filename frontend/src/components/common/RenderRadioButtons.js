import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Radio } from "antd";

/**
 * @class RenderRadioButtons - Ant Design `Radio` component used for boolean values in redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
};

class RenderRadioButtons extends Component {
  state = { value: false };

  onChange = (e) => {
    this.setState({ value: e.target.value });
  };

  render() {
    return (
      <Form.Item
        validateStatus={this.props.meta.touched ? this.props.meta.error && "error" : ""}
        label={this.props.label}
      >
        <Radio.Group id={this.props.id} value={this.state.value}>
          <Radio value>Yes</Radio>
          <Radio value={false}>No</Radio>
        </Radio.Group>
      </Form.Item>
    );
  }
}

RenderRadioButtons.propTypes = propTypes;

export default RenderRadioButtons;
