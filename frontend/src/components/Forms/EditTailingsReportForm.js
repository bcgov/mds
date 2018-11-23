import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import RenderField from '@/components/common/RenderField';
import { Form, Button, Col, Row, Popconfirm } from 'antd';
import * as FORM from '@/constants/forms';
import { required } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export const EditTailingsReportForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col>
          <Form.Item>
            <Field
              id="tsf_name"
              name="tsf_name"
              label='Report Name'
              component={RenderField}
              validate={[required]}
            />
          </Form.Item>
          <Form.Item>
            <Field
              id="tsf_name"
              name="tsf_name"
              label='Due Date'
              component={RenderField}
              validate={[required]}
            />
            <Form.Item>
              <Field
                id="tsf_name"
                name="tsf_name"
                label='Received Date'
                component={RenderField}
                validate={[required]}
              />
              <Form.Item>
                <Field
                  id="tsf_name"
                  name="tsf_name"
                  label='Status'
                  component={RenderField}
                  validate={[required]}
                />
              </Form.Item>
            </Form.Item>
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