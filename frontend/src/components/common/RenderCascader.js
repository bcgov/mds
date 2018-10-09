import React from 'react';
import PropTypes from 'prop-types';
import { Form, Cascader } from 'antd';
import {MINE_STATUS} from '@/constants/status';

/**
 * @constant RenderCascader - Ant Design `Cascader` component for redux-form.
 */

const propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  input: PropTypes.any,
  placeholder: PropTypes.string,
  meta: PropTypes.object,
};

const RenderCascader = ({
  id,
  input,
  placeholder,
  meta: { touched, error, warning },
}) => (
    <Form.Item
      validateStatus={(touched ? ((error && 'error') || (warning && 'warning')) : '')}
      help={touched &&
        ((error && <span>{error}</span>) ||
          (warning && <span>{warning}</span>))
      }
    >
     <Cascader id={id} options={MINE_STATUS} placeholder={placeholder} {...input}/>
    </Form.Item>
  );

RenderCascader.propTypes = propTypes;

export default RenderCascader;