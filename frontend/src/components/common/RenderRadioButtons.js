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
  disabled: PropTypes.bool,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  disabled: false,
};

class RenderRadioButtons extends Component {
  state = { value: false };

  render() {
    const options = [{ label: "Yes", value: true }, { label: "No", value: false }];
    return (
      <Form.Item
        validateStatus={this.props.meta.touched ? this.props.meta.error && "error" : ""}
        label={this.props.label}
      >
        <Radio.Group
          disabled={this.props.disabled}
          checked={() => {
            this.setState((prevState) => ({ value: !prevState.value }));
          }}
          defaultValue={this.state.value}
          {...this.props.input}
          id={this.props.id}
          options={options}
        />
      </Form.Item>
    );
  }
}

RenderRadioButtons.propTypes = propTypes;
RenderRadioButtons.defaultProps = defaultProps;

export default RenderRadioButtons;
