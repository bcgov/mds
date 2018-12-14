import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form, Button, Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
};

export const AdvanceSearchForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="status"
            name="tstatus"
            placeholder="Select mine status"
            component={renderConfig.FIELD}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="status"
            name="tstatus"
            placeholder="Select mine status"
            component={renderConfig.FIELD}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="status"
            name="tstatus"
            placeholder="Select mine status"
            component={renderConfig.FIELD}
          />
        </Form.Item>
      </Col>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="status"
            name="tstatus"
            placeholder="Select mine status"
            component={renderConfig.FIELD}
          />
        </Form.Item>
      </Col>
    </Row>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="major_mine_ind"
            name="major_mine_ind"
            label="Major Mine"
            type="checkbox"
            component={renderConfig.CHECKBOX}
          />
        </Form.Item>
      </Col>
      <Col>
        <Form.Item>
          <Field
            id="major_mine_ind"
            name="major_mine_ind"
            label="Major Mine"
            type="checkbox"
            component={renderConfig.CHECKBOX}
          />
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Button className="full-mobile" type="primary" htmlType="submit">
        {props.title}
      </Button>
    </div>
  </Form>
);

AdvanceSearchForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADVANCE_SEARCH,
  touchOnBlur: false,
})(AdvanceSearchForm);
