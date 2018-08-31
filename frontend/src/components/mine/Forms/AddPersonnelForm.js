import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const AddPersonnelForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Field
              id="first_name"
              name="first_name"
              label='First Name'
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item>
            <Field
              id="surname"
              name="surname"
              label='Surname'
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="btn-right"><Button type="primary" htmlType="submit">Create Personnel</Button></div>
    </Form>
  );
};

AddPersonnelForm.propTypes = propTypes;

export default (reduxForm({
    form: FORM.ADD_PERSONNEL,
    destroyOnUnmount: true
  })(AddPersonnelForm)
);