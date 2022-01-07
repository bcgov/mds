/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { change } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Checkbox } from "antd";

/**
 * @constant RenderGroupCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  label: PropTypes.string.isRequired,
  meta: PropTypes.objectOf(PropTypes.any).isRequired,
  input: PropTypes.objectOf(PropTypes.string).isRequired,
  disabled: PropTypes.bool.isRequired,
  options: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  change: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
};

const onChange = (checkedValues, change, form, name) => {
  change(form, name, checkedValues);
};

const RenderGroupCheckbox = (props) => {
  // console.log(props.formValues[props.fieldName]);
  // console.log(props.formValues);
  // console.log(props);
  return (
    <Form.Item validateStatus={props.meta.touched ? props.meta.error && "error" : ""}>
      <Checkbox.Group
        id={props.id}
        checked={props.input.value}
        options={props.options}
        disabled={props.disabled}
        defaultValue={props.formValues[props.fieldName]}
        {...props.input.value}
        onChange={(values) => onChange(values, props.change, props.formName, props.fieldName)}
      />
    </Form.Item>
  );
};

RenderGroupCheckbox.propTypes = propTypes;

const mapDispatchToProps = (dispatch) => bindActionCreators({ change }, dispatch);
export default connect(null, mapDispatchToProps)(RenderGroupCheckbox);
