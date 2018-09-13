import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row, Card } from 'antd';
import * as FORM from '@/constants/forms';
import { required, email, phoneNumber, maxLength, number } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const AddPersonnelForm = (props) => {
  return (
    <div className="form__personnel">
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
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item>
              <Field
                id="phone_no"
                name="phone_no"
                label='Phone Number'
                component={RenderField}
                validate={[required, phoneNumber, maxLength(12)]}
              />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              <Field
                id="phone_ext"
                name="phone_ext"
                label='Ext'
                component={RenderField}
                validate={[number, maxLength(5)]}
              />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item>
              <Field
                id="email"
                name="email"
                label='Email'
                component={RenderField}
                validate={[required, email]}
              />
            </Form.Item>
          </Col>
        </Row>
        <div className="right"><Button type="primary" htmlType="submit">Create Personnel</Button></div>
      </Form>
    </div>
  );
};

AddPersonnelForm.propTypes = propTypes;

export default (reduxForm({
    form: FORM.ADD_PERSONNEL,
    onSubmitSuccess: resetForm(FORM.ADD_PERSONNEL),
  })(AddPersonnelForm)
);