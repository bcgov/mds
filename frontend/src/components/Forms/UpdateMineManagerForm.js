import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import RenderDate from '@/components/common/RenderDate';
import RenderLargeSelect from '@/components/common/RenderLargeSelect';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
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
              label="Mine Manager"
              component={RenderLargeSelect}
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
              label='Select a Start date'
              placeholder="yyyy-mm-dd"
              component={RenderDate}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
<<<<<<< HEAD
        <Popconfirm placement="topRight" title="Are you sure you want to cancel?" onConfirm={props.closeModal} okText="Yes" cancelText="No">
=======
        <Popconfirm placement="topRight" title="Are you sure you want to cancel?" onConfirm={props.toggleModal} okText="Yes" cancelText="No">
>>>>>>> d7d2484ee69130cc497ae54804dfe397ff4db834
          <Button type="button">Cancel</Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit">Update Mine Manager</Button>
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