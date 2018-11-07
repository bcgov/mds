import React from 'react';
import PropTypes from 'prop-types';
import { Form, Cascader } from 'antd';

/**
 * @constant RenderCascader - Ant Design `Cascader` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
  options: PropTypes.array.isRequired
};

const RenderCascader = ({
  id,
  input,
  placeholder,
  options,
  label,
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
     <Cascader expandTrigger="hover" id={id} placeholder={placeholder} options={options} {...input}/>
    </Form.Item>
  );

RenderCascader.propTypes = propTypes;

export default RenderCascader;