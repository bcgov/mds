import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row } from 'antd';
import RenderLargeSelect from '@/components/common/RenderLargeSelect';
import RenderDate from '@/components/common/RenderDate';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  isPerson: PropTypes.bool,
  permittee: PropTypes.array,
};

const defaultProps = {
  parties: {},
  partyIds: [],
  id: '',
  label: '',
};

export const UpdateMineManagerForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id={props.id}
              name={props.id}
              label={props.label}
              component={RenderLargeSelect}
              data={props.partyIds}
              option={props.parties}
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
              component={RenderDate}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">{props.action}</Button></div>
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