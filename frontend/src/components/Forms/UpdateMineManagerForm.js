import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
};

const defaultProps = {
  parties: {},
  partyIds: [],
};

export const UpdateMineManagerForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="mineManager"
              name="mineManager"
              label="Mine Manager *"
              component={renderConfig.LARGE_SELECT}
              data={props.partyIds}
              options={props.parties}
              validate={[required]}
              handleChange={props.handleChange}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="startDate"
              name="startDate"
              label='Select a Start date *'
              placeholder="yyyy-mm-dd"
              component={renderConfig.DATE}
              validate={[required]}
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

UpdateMineManagerForm.propTypes = propTypes;
UpdateMineManagerForm.defaultProps = defaultProps;

export default (reduxForm({
    form: FORM.UPDATE_MINE_MANAGER,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.UPDATE_MINE_MANAGER),
  })(UpdateMineManagerForm)
);