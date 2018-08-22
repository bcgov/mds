import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/reusables/RenderField';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength } from '@/utils/Validate';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired
};

export const AddMineRecordform = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item>
            <Field
              id="mineName"
              name="mineName"
              label='Mine Name'
              component={RenderField}
              validate={[required, maxLength(60), minLength(3)]}
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
    form: FORM.ADD_MINE_RECORD
  })(AddMineRecordform)
);