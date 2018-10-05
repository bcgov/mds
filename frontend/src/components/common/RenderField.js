import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';

/**
 * @constant RenderField - Ant Design `Input` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
};

const RenderField = ({
  id,
  input,
  label,
  placeholder,
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
      <Input id={id} placeholder={placeholder} {...input} />
    </Form.Item>
  );

RenderField.propTypes = propTypes;

export default RenderField;