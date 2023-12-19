import React, { Component } from "react";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { DatePicker } from "antd";
import moment, { Moment } from "moment";

/**
 * @constant RenderYear  - Ant Design `DatePicker` component for redux-form.
 */

interface RenderYearProps {
  id: any;
  input: Record<string, any>;
  label: string;
  placeholder?: string;
  required?: boolean;
  onChange?: (date: Moment | null, dateString: string) => void;
  disabledDate?: (current: Moment | null) => boolean;
  disabled?: boolean;
  meta: Record<string, any>;
}

const defaultProps = {
  placeholder: "",
  onChange: () => {},
  disabledDate: () => false, // Default value for disabledDate
  disabled: false,
  required: false,
};

type RenderYearState = {
  isopen: boolean;
  time: Moment | null;
};

export class RenderYear extends Component<RenderYearProps, RenderYearState> {
  static defaultProps = defaultProps; // Initialize default props here

  constructor(props: RenderYearProps) {
    super(props);
    this.state = {
      isopen: false,
      time: props.input.value ? moment(`${props.input.value}-01-01`) : null,
    };
  }

  handlePanelChange = (value: Moment) => {
    this.setState({
      time: value,
      isopen: false,
    });
    this.props.onChange?.(value, moment(value).format("YYYY"));
  };

  handleOpenChange = (status: boolean) => {
    this.setState({ isopen: status });
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

export default RenderYear;
