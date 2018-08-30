import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength, number } from '@/utils/Validate';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleCancel: PropTypes.func.isRequired
};

export const AddMineRecordform = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Field
              id="name"
              name="name"
              label='Mine Name *'
              component={RenderField}
              validate={[required, maxLength(60), minLength(3)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Field
              id="latitude"
              name="latitude"
              label='Lat'
              component={RenderField}
              validate={[number]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item>
            <Field
              id="longitude"
              name="longitude"
              label='Long'
              component={RenderField}
              validate={[number]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Button type="primary" htmlType="submit">Create Mine</Button>
    </Form>
  );
};

AddMineRecordform.propTypes = propTypes;

export default (reduxForm({
    form: FORM.ADD_MINE_RECORD,
    destroyOnUnmount: true
  })(AddMineRecordform)
);