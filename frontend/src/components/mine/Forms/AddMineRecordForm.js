import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength, number, lat, lon } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const AddMineRecordform = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
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
              label='Latitude'
              component={RenderField}
              validate={[number, maxLength(10), lat]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item>
            <Field
              id="longitude"
              name="longitude"
              label='Longitude'
              component={RenderField}
              validate={[number, maxLength(12), lon]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right"><Button type="primary" htmlType="submit">Create Mine Record</Button></div>
    </Form>
  );
};

AddMineRecordform.propTypes = propTypes;

export default (reduxForm({
    form: FORM.ADD_MINE_RECORD,
    onSubmitSuccess: resetForm(FORM.ADD_MINE_RECORD),
  })(AddMineRecordform)
);