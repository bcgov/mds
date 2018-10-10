import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Divider } from 'antd';
import RenderLargeSelect from '@/components/common/RenderLargeSelect';
import RenderSelect from '@/components/common/RenderSelect';
import RenderDate from '@/components/common/RenderDate';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  parties: PropTypes.object.isRequired,
  partyIds: PropTypes.array.isRequired,
  permit: PropTypes.array,
};

const defaultProps = {
  parties: {},
  partyIds: [],
  permit: [],
};

const permitteeOptions = (permit) => {
  const dataArray = []
  permit.map((obj) => {
    const data = {
      value: obj.permittee[0].permittee_guid.concat(', ', obj.permit_guid),
      option: obj.permittee[0].party.name.concat(", ", obj.permit_no)
    }
    dataArray.push(data);
  });
  return dataArray;
}

export const UpdatePermitteeForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Divider>
      <h2>From</h2>
    </Divider>
    <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="permittee"
              name="permittee"
              label="Current Permittee"
              placeholder="Select Current Permittee"
              component={RenderSelect}
              data={permitteeOptions(props.permit)}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Divider >
        <h2>To</h2>
      </Divider>
      <Row gutter={16}>
        <Col md={12} xs={24}>
          <Form.Item>
            <Field
              id="party"
              name="party"
              label="New Permittee"
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
      <div className="right center-mobile"><Button className="full-mobile" type="primary" htmlType="submit">Update Permittee</Button></div>
    </Form>
  );
};

UpdatePermitteeForm.propTypes = propTypes;
UpdatePermitteeForm.defaultProps = defaultProps;

export default (reduxForm({
    form: FORM.UPDATE_PERMITTEE,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.UPDATE_PERMITTEE),
  })(UpdatePermitteeForm)
);