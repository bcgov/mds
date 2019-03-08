import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, maxLength, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";

const originalPermit = "OGP";

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
            id="issue_date"
            name="issue_date"
            label="Issue date"
            component={RenderDate}
            validate={[required, dateNotInFuture]}
          />
        </Form.Item>
        {props.initialValues.permit_amendment_type_code !== originalPermit && (
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Description"
              component={RenderAutoSizeField}
              validate={[maxLength(280)]}
            />
          </Form.Item>
        )}
      </Col>
    </Row>
    <br />
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
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.ADD_PERMIT_AMENDMENT),
})(AddPermitAmendmentForm);
