import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { currency } from "@common/utils/Validate";
import { currencyMask } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { CoreTooltip } from "@/components/common/CoreTooltip";

import RenderField from "@/components/common/RenderField";
import RenderDate from "@/components/common/RenderDate";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export const PermitAmendmentSecurityForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} sm={24}>
        <div className="field-title">
          Security Assessment
          <CoreTooltip title="Amount assessed for this application will be added to the total assessed amount on the permit." />
        </div>
        <Field
          id="security_adjustment"
          name="security_adjustment"
          component={RenderField}
          disabled={!props.isEditMode}
          allowClear
          {...currencyMask}
          validate={[currency]}
        />
      </Col>
      <Col md={12} sm={24}>
        <div className="field-title">
          Security Received
          <CoreTooltip title="Do not mark as received until the security amount is paid in full." />
        </div>
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
          onConfirm={() => props.onCancel()}
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
