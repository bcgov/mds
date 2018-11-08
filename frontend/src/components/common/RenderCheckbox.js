import React from 'react';
import PropTypes from 'prop-types';
import { Form, Checkbox } from 'antd';

/**
 * @constant RenderCheckbox - Ant Design `Checkbox` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
};

const RenderCheckbox = ({
  id,
  meta: { touched, error, warning },
}) => (
    <Form.Item
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
      <Checkbox id={id}>Major Mine</Checkbox>
    </Form.Item>
  );

RenderCheckbox.propTypes = propTypes;

export default RenderCheckbox;