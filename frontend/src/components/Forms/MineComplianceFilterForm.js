import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
};

export const MineComplianceFilterForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit} onReset={props.reset}>
    <div>
      <Row gutter={6}>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="order_no"
            name="order_no"
            label="Order Number"
            placeholder="Start typing order number"
            component={renderConfig.FIELD}
          />
        </Col>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="report_no"
            name="report_no"
            label="Report Number"
            placeholder="Start typing report number"
            component={renderConfig.FIELD}
          />
        </Col>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="violation"
            name="violation"
            label="Code/Act Violation"
            placeholder="Select code/act violation number"
            component={renderConfig.FIELD}
          />
        </Col>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="inspector"
            name="inspector"
            label="Inspector IDIR"
            placeholder="Start typing inspectors IDIR"
            component={renderConfig.FIELD}
          />
        </Col>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="overdue"
            name="order_status"
            label="Order status"
            component={renderConfig.SELECT}
            data={[{ value: "true", label: "Overdue" }, { value: "false", label: "Open" }]}
          />
        </Col>
        <Col md={8} xs={24} sm={12}>
          <Field
            id="due_date"
            name="due_date"
            label="Order due date"
            component={renderConfig.DATE}
          />
        </Col>
      </Row>
    </div>
    <div className="right center-mobile">
      <Button className="full-mobile" type="secondary" htmlType="reset">
        Clear Filters
      </Button>
      <Button className="full-mobile" type="primary" htmlType="submit">
        Apply Filters
      </Button>
    </div>
  </Form>
);

MineComplianceFilterForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.MINE_COMPLIANCE_FILTER,
  touchOnBlur: false,
})(MineComplianceFilterForm);
