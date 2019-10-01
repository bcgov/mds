import React from "react";
import PropTypes from "prop-types";
import { Divider } from "antd";

const propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  children: PropTypes.any.isRequired,
  underline: PropTypes.bool,
};

const defaultProps = {
  underline: false,
};

const FormItemLabel = (props) => (
  <div className="padding-md--bottom">
    <div className="ant-col ant-form-item-label padding-large--top ">
      <label htmlFor="label">{props.children}</label>
    </div>
    {props.underline && <Divider style={{ margin: "0" }} />}
  </div>
);

FormItemLabel.propTypes = propTypes;
FormItemLabel.defaultProps = defaultProps;

export default FormItemLabel;
