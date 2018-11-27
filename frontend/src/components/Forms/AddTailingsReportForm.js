import React from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form'
import { Form, Button, Col, Row, Popconfirm, Dropdown } from 'antd';
import * as FORM from '@/constants/forms';
import { required, exactLength, number } from '@/utils/Validate';
import { resetForm } from '@/utils/helpers';
import { renderConfig } from '@/components/common/config';

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};


export const AddTailingsReportForm = (props) => {
    return (
        <Form layout="vertical" onSubmit={props.handleSubmit}>
          <Form.Item>
            <Field
              id="mine_tailings_reports"
              name="mine_tailings_reports"
              label='TSF Required Reports'
              placeholder="Please select a required report"
              options={props.mineTSFRequiredReports}
              component={renderConfig.CASCADER}
              validate={[required]}
            />
          </Form.Item>
          <div className="right center-mobile">
            <Popconfirm placement="topRight" title="Are you sure you want to cancel?" onConfirm={props.closeModal} okText="Yes" cancelText="No">
              <Button className="full-mobile" type="secondary">Cancel</Button>
            </Popconfirm>
            <Button className="full-mobile" type="primary" htmlType="submit">{props.title}</Button>
          </div>
        </Form>
  );
};


AddTailingsReportForm.propTypes = propTypes;

export default (reduxForm({
  form: FORM.ADD_TAILINGS_REPORT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_TAILINGS_REPORT),
})(AddTailingsReportForm)
);