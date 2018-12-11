import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, Select, Checkbox } from "antd";

/**
 * @constant RenderSelect - Ant Design `Select` component for redux-form - used for small data sets that (< 100);
 */
const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  opton: PropTypes.object,
  meta: PropTypes.object,
  data: PropTypes.array,
};

export class RenderMultiSelect extends Component {
  state = { isChecked: false };

  handleCheckBox = () => {
    this.setState({ isChecked: !this.state.isChecked });
  };

  // renderOptions = (data) => {
  //   const options = data
  //     .filter(({ exclusive }) => exclusive)
  //     .map((option) => (
  //       <Checkbox onChange={this.handleCheckBox} key={option.value} id={option.value}>
  //         {option.label}
  //       </Checkbox>
  //     ));
  //   return options;
  // };

  render() {
    return (
      <div>
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
          {/* {this.renderOptions(this.props.data)} */}
          <Select
            disabled={!this.props.data}
            mode="multiple"
            getPopupContainer={() => document.getElementById(this.props.id)}
            placeholder={this.props.placeholder}
            id={this.props.id}
            {...this.props.input}
          >
            {this.props.data &&
              this.props.data
                .filter(({ exclusive }) => !exclusive)
                .map((value) => <Select.Option key={value.value}>{value.label}</Select.Option>)}
          </Select>
        </Form.Item>
      </div>
    );
  }
}

RenderMultiSelect.propTypes = propTypes;

export default RenderMultiSelect;
