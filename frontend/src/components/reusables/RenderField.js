import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';


const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  autosize: PropTypes.bool,
  type: PropTypes.string,
  meta: PropTypes.object,
};

/**
 * Ant Design `Input` component for redux-form.
 */
const RenderField = ({
  id,
  input,
  label,
  placeholder,
  type,
  meta: { touched, error, warning },
}) => (
    <Form.Item
      label={label}
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
      <Input id={id} type={type} placeholder={placeholder} {...input} />
    </Form.Item>
  );

RenderField.propTypes = propTypes;

export default RenderField;