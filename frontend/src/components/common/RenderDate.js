import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Form, DatePicker } from 'antd';


const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  label: PropTypes.string,
  onChange: PropTypes.func,
  meta: PropTypes.object,
};

/**
 * Ant Design `DatePicker` component for redux-form.
 */
const RenderDate = ({
  id,
  input,
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
    <DatePicker 
      id={id}
      {...input}
      onChange={(date, dateString) => input.onChange(dateString)}
      value={input.value ? moment(input.value) : null}
    />
    </Form.Item>
  );

RenderDate.propTypes = propTypes;

export default RenderDate;