import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderField from "@/components/common/RenderField";
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

export const AddPermitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row gutter={16}>
      <Col>
        <Form.Item>
          <Field
            id="permit_type"
            name="permit_type"
            label="Permit type*"
            placeholder="Select a permit type"
            component={RenderSelect}
            data={[{ name: "test", value: "test" }]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="permit activity type*"
            name="permit_activity_type"
            label="Permit activity type*"
            placeholder="Select a permit activity type"
            component={RenderSelect}
            data={[{ name: "test", value: "test" }]}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="permit_no"
            name="permit_no"
            label="Permit number*"
            component={RenderField}
            validate={[required]}
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

AddPermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_PERMIT),
})(AddPermitForm);
