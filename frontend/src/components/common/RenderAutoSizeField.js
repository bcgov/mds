import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input } from 'antd';


const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  meta: PropTypes.object,
};

const { TextArea } = Input;
/**
 * Ant Design `Input` component for redux-form.
 */
const RenderAutoSizeField = ({
  id,
  input,
  label,
  placeholder,
  meta: { touched, error, warning },
}) => (
    <Form.Item
      label={label}
      placeholder={placeholder}
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
      <TextArea id={id} {...input} autosize/>
    </Form.Item>
  );

RenderAutoSizeField.propTypes = propTypes;

export default RenderAutoSizeField;