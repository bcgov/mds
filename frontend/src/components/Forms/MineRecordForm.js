import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import * as FORM from '@/constants/forms';
import { required, maxLength, minLength, number, lat, lon } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string,
  mineStatusOptions: PropTypes.array.isRequired,
  mineRegionOptions: PropTypes.array.isRequired,
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
              component={renderConfig.FIELD}
              validate={[required, maxLength(60), minLength(3)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="mine_status"
              name="mine_status"
              label='Mine Status *'
              placeholder="Please select status"
              options={props.mineStatusOptions}
              component={renderConfig.CASCADER}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="mine_region"
              name="mine_region"
              label="Mine Region *"
              placeholder="Select a Region"
              component={renderConfig.SELECT}
              data={props.mineRegionOptions}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="latitude"
              name="latitude"
              label='Latitude'
              component={renderConfig.FIELD}
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
              component={renderConfig.FIELD}
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
              component={renderConfig.AUTO_SIZE_FIELD}
              validate={[maxLength(300)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="major_mine_ind"
              name="major_mine_ind"
              label='Major Mine'
              type="checkbox"
              component={renderConfig.CHECKBOX}
              validate={[maxLength(300)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm placement="topRight" title="Are you sure you want to cancel?" onConfirm={props.closeModal} okText="Yes" cancelText="No">
          <Button className="full-mobile">Cancel</Button>
        </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit">{props.title}</Button>
     </div>
    </Form>
  );
};

MineRecordform.propTypes = propTypes;

export default (reduxForm({
    form: FORM.MINE_RECORD,
    touchOnBlur: false,
    enableReinitialize : true,
    onSubmitSuccess: resetForm(FORM.MINE_RECORD),
  })(MineRecordform)
);
