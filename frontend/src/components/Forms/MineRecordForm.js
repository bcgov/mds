import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/common/RenderField';
import RenderAutoSizeField from '@/components/common/RenderAutoSizeField';
import RenderCascader from '@/components/common/RenderCascader';
import { Form, Button, Col, Row } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength, number, lat, lon } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  title: PropTypes.string
};

export const MineRecordform = (props) => {
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
      {/* commented out until ready to add status */}
      {/* <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="mine_status"
              name="mine_status"
              label='Mine Status *'
              placeholder="Plese select status"
              component={RenderCascader}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row> */}
      <Row gutter={16}>
        <Col md={12} xs={24}>
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
        <Col md={12} xs={24}>
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
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="note"
              name="note"
              label='Notes'
              component={RenderAutoSizeField}
              validate={[maxLength(300)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">{props.title}</Button></div>
    </Form>
  );
};

MineRecordform.propTypes = propTypes;

export default (reduxForm({
    form: FORM.MINE_RECORD,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.MINE_RECORD),
  })(MineRecordform)
);