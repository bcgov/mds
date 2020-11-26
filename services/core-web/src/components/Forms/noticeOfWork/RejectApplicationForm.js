import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
};

export const RejectApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row>
      <Col span={24}>
        <Form.Item>
          <Field
            id="status_reason"
            name="status_reason"
            label={props.type === "REJ" ? "Reason for Rejection" : "Reason for Withdrawal"}
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[maxLength(280)]}
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
      <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

RejectApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.REJECT_APPLICATION,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.REJECT_APPLICATION),
  enableReinitialize: true,
})(RejectApplicationForm);
