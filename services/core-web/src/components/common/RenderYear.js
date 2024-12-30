/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, DatePicker } from "antd";
import moment from "moment";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
};

const defaultProps = {
  label: "",
  placeholder: "",
  disabled: false,
};

const getInputValue = (value) => (value ? moment(`${value}-01-01`) : null);

export class RenderDate extends Component {
  state = {
    value: getInputValue(this.props.input.value),
    isOpen: false,
  };

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.input.value !== this.props.input.value) {
      this.setState({
        value: getInputValue(nextProps.input.value),
      });
    }
  };

  handlePanelChange = (value) => {
    this.setState({
      value: value,
      isOpen: false,
    });
    this.props.input.onChange(value ? moment(value).format("YYYY") : null);
  };

  handleOpenChange = (isOpen) => {
    this.setState({ isOpen });
  };

  handleChange = () => {
    this.setState({
      value: null,
    });
    this.props.input.onChange(null);
  };

  render = () => (
    <Form.Item
      label={this.props.label}
      validateStatus={
        this.props.meta.touched
          ? (this.props.meta.error && "error") || (this.props.meta.warning && "warning")
          : ""
      }
      help={
        this.props.meta.touched &&
        ((this.props.meta.error && <span>{this.props.meta.error}</span>) ||
          (this.props.meta.warning && <span>{this.props.meta.warning}</span>))
      }
    >
      <DatePicker
        id={this.props.id}
        value={this.state.value}
        open={this.state.isOpen}
        placeholder={this.props.placeholder}
        disabled={this.props.disabled}
        mode="year"
        format="YYYY"
        onOpenChange={this.handleOpenChange}
        onPanelChange={this.handlePanelChange}
        onChange={this.handleChange}
      />
    </Form.Item>
  );
}

RenderDate.propTypes = propTypes;
RenderDate.defaultProps = defaultProps;

export default RenderDate;
