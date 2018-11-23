import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import * as FORM from '@/constants/forms';
import { required, exactLength, number } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const AddTenureNumberForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="tenure_number_id"
              name="tenure_number_id"
              label='Tenure Number'
              component={renderConfig.FIELD}
              validate={[required, exactLength(7), number]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm placement="topRight" title="Are you sure you want to cancel?" onConfirm={props.closeModal} okText="Yes" cancelText="No">
          <Button className="full-mobile" type="secondary">Cancel</Button>
        </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit">{props.title}</Button>
     </div>
    </Form>
  );
};

AddTenureNumberForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.ADD_TENURE_NUMBER,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_TENURE_NUMBER),
})(AddTenureNumberForm)
);