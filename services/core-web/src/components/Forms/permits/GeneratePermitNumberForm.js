import React from "react";
import PropTypes from "prop-types";
import { reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Alert } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
};

const defaultProps = {
  disabled: false,
};

export const GeneratePermitNumberForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Alert
      message="This action is final"
      description="The generated permit number will be assigned to the current draft permit."
      type="warning"
      showIcon
      style={{ textAlign: "left" }}
    />
    <Row gutter={16}>
      <Col span={24}>
        <br />
        <div>
          <p>You will be able to generate Acknowledgment Letter and Permit afterwards</p>
        </div>
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
      <Button
        className="full-mobile"
        htmlType="submit"
        type="primary"
        loading={props.submitting}
        disabled={props.disabled}
        on
      >
        Generate Permit Number
      </Button>
    </div>
  </Form>
);

GeneratePermitNumberForm.propTypes = propTypes;
GeneratePermitNumberForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.GENERATE_PERMIT_NUMBER,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.GENERATE_PERMIT_NUMBER),
})(GeneratePermitNumberForm);
