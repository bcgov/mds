import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row } from 'antd';
import RenderSelect from '@/components/common/RenderSelect';
import RenderDate from '@/components/common/RenderDate';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  personnel: PropTypes.object.isRequired,
  personnelIds: PropTypes.array.isRequired
};

const defaultProps = {
  personnel: {},
  personnelIds: []
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
              label='Mine Manager'
              component={RenderSelect}
              data={props.personnelIds}
              option={props.personnel}
              validate={[required]}
            />
          </Form.Item>
        </Col>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="startDate"
              name="startDate"
              label='Select a Start date'
              component={RenderDate}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">Update Mine Manager</Button></div>
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