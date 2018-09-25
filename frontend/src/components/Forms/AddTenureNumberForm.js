import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/common/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, exactLength, number } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const AddTenureNumberForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="tenureNumber"
              name="tenureNumber"
              label='Tenure Number'
              component={RenderField}
              validate={[required, exactLength(7), number]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">Add Tenure Number</Button></div>
    </Form>
  );
};

AddTenureNumberForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.ADD_TENURE_NUMBER,
  onSubmitSuccess: resetForm(FORM.ADD_TENURE_NUMBER),
})(AddTenureNumberForm)
);