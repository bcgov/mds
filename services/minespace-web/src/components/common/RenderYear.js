/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { DatePicker } from "antd";
import moment from "moment";

/**
 * @constant RenderDate  - Ant Design `DatePicker` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  input: PropTypes.objectOf(PropTypes.any).isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  onChange: PropTypes.func,
  disabledDate: PropTypes.func,
  disabled: PropTypes.bool,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
};

const defaultProps = {
  placeholder: "",
  onChange: () => {},
  disabledDate: () => {},
  disabled: false,
  required: false,
};

export class RenderDate extends Component {
  state = {
    isopen: false,
    time: this.props.input.value ? moment(`${this.props.input.value}-01-01`) : null,
  };

  handlePanelChange = (value) => {
    this.setState({
      time: value,
      isopen: false,
    });
    this.props.input.onChange(moment(value).format("YYYY"));
  };

  handleOpenChange = (status) => {
    if (status) {
      this.setState({ isopen: true });
    } else {
      this.setState({ isopen: false });
    }
  };

  clearValue = () => {
    this.setState({
      time: null,
    });
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
      required={this.props.required}
    >
      <DatePicker
        id={this.props.id}
        value={this.state.time}
        open={this.state.isopen}
        placeholder={this.props.placeholder}
        mode="year"
        format="YYYY"
        onOpenChange={this.handleOpenChange}
        onPanelChange={this.handlePanelChange}
        onChange={this.clearValue}
        disabledDate={this.props.disabledDate}
        disabled={this.props.disabled}
      />
    </Form.Item>
  );
}

RenderDate.propTypes = propTypes;
RenderDate.defaultProps = defaultProps;

export default RenderDate;
