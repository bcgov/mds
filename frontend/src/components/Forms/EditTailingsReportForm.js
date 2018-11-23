import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/common/RenderField';
import RenderDate from '@/components/common/RenderDate';
import RenderSelect from '@/components/common/RenderSelect';
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  statusOptions: PropTypes.array.isRequired,
};

export const EditTailingsReportForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="tsf_report_name"
              name="tsf_report_name"
              label='Report Name'
              component={renderConfig.FIELD}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="tsf_report_due_date"
              name="tsf_report_due_date"
              label='Due Date'
              component={RenderDate}
              validate={[required]}
            />
          </Form.Item>
        <Form.Item>
            <Field
            id="tsf_report_received_date"
            name="tsf_report_received_date"
            label='Received Date'
            component={RenderDate}
            validate={[required]}
            />
        </Form.Item>   
          <Form.Item>
            <Field
              id="tsf_report_status"
              name="tsf_report_status"
              label="Status"
              placeholder="Select a Status"
              component={renderConfig.SELECT}
              data={props.statusOptions}
              validate={[required]}
            />
          </Form.Item>
        </Col>
      </Row>
      <div className="right center-mobile">
        <Popconfirm placement="topRight" title="Butts?" onConfirm={props.closeModal} okText="Yes" cancelText="No">
          <Button type="secondary">Cancel</Button>
        </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit">{props.title}</Button>
     </div>
    </Form>
  );
};

EditTailingsReportForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.EDIT_TAILINGS,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_TAILINGS),
})(EditTailingsReportForm)
);