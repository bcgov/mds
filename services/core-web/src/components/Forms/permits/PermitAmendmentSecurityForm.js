import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { currency } from "@common/utils/Validate";
import { currencyMask } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";

import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
};

export const PermitAmendmentSecurityForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <div className="field-title">Security Total</div>
        <Field
          id="security_total"
          name="security_total"
          component={RenderField}
          disabled={!props.isEditMode}
          allowClear
          {...currencyMask}
          validate={[currency]}
        />
      </Col>
      <Col md={12} sm={24}>
        <div className="field-title">Security Received</div>
        <Field
          id="security_received_date"
          name="security_received_date"
          component={RenderDate}
          disabled={!props.isEditMode}
        />
      </Col>
    </Row>
    {props.isEditMode && (
      <div className="right center-mobile">
        <Popconfirm
          placement="topRight"
          title="Are you sure you want to cancel?"
          okText="Yes"
          cancelText="No"
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          Save
        </Button>
      </div>
    )}
  </Form>
);

PermitAmendmentSecurityForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_PERMIT,
  touchOnBlur: false,
  enableReinitialize: true,
})(PermitAmendmentSecurityForm);
