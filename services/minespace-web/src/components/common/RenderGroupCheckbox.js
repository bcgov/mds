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
};

const onChange = (checkedValues) => {
  console.log(checkedValues);
};

const RenderGroupCheckbox = (props) => (
  <Form.Item validateStatus={props.meta.touched ? props.meta.error && "error" : ""}>
    {/* <Checkbox id={props.id} checked={props.input.value} {...props.input} disabled={props.disabled}>
      {props.label}
    </Checkbox> */}

    <Checkbox.Group
      id={props.id}
      checked={props.input.value}
      options={props.options}
      disabled={props.disabled}
      defaultValue={[]}
      {...props.input.value}
      // onChange={onChange}
    />
  </Form.Item>
);

RenderGroupCheckbox.propTypes = propTypes;

const mapDispatchToProps = (dispatch) => bindActionCreators({ change }, dispatch);
export default connect(null, mapDispatchToProps)(RenderGroupCheckbox);
// export default RenderGroupCheckbox;
