import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderSelect from "@/components/common/RenderSelect";
import RenderDate from "@/components/common/RenderDate";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const AddPermitAmendmentForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="amendment_type"
            name="amendment_type"
            label="Amendment type*"
            placeholder="Select an amendment type"
            component={RenderSelect}
            data={[{ name: "test", value: "test" }]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="received_date"
            name="received_date"
            label="Received Date"
            component={RenderDate}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue Date"
            component={RenderDate}
            validate={[required]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="authorization_end_date"
            name="authorization_end_date"
            label="Authorization End Date"
            component={RenderDate}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" disabled={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

AddPermitAmendmentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_PERMIT_AMENDMENT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_PERMIT_AMENDMENT),
})(AddPermitAmendmentForm);
