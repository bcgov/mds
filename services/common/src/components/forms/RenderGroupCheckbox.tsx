import React from "react";
import PropTypes from "prop-types";
import { change } from "redux-form";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Checkbox, Form } from "antd";

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
  setInitialValues: PropTypes.func,
};

const onChange = (checkedValues, change, form, name) => {
  change(form, name, checkedValues);
};

const RenderGroupCheckbox = (props) => {
  return (
    <Form.Item
      label={props.label}
      validateStatus={props.meta.touched ? props.meta.error && "error" : ""}
    >
      <Checkbox.Group
        // apparently id & checked do not exist on Checkbox.Group
        // id={props.id}
        name={props.name}
        // checked={props.input.value}
        options={props.options}
        disabled={props.disabled}
        defaultValue={props.formValues[props.fieldName]}
        value={
          props.setInitialValues && !props.meta.dirty ? props.setInitialValues() : props.input.value
        }
        onChange={(values) => onChange(values, props.change, props.formName, props.fieldName)}
      />
    </Form.Item>
  );
};

RenderGroupCheckbox.propTypes = propTypes;

const mapDispatchToProps = (dispatch) => bindActionCreators({ change }, dispatch);
export default connect(null, mapDispatchToProps)(RenderGroupCheckbox);
