import React from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { formatDate, formatMoney, resetForm } from "@common/utils/helpers";
import { Button, Col, Row, Popconfirm, Alert } from "antd";

import { maxLength } from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  prev: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  draftAmendment: CustomPropTypes.permit.isRequired,
};

export const RejectApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    {props.draftAmendment?.security_received_date && props.draftAmendment?.security_adjustment && (
      <Alert
        message="Return Reclamation Securities"
        description={`A Security adjustment of ${formatMoney(
          props.draftAmendment.security_adjustment
        )} was received on ${formatDate(
          props.draftAmendment.security_received_date
        )} for this application which needs to be returned to the applicant or moved to a new application by the applicant. Update this information before rejecting.`}
        type="error"
        showIcon
        style={{ textAlign: "left" }}
      />
    )}
    <br />
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
      <Button className="full-mobile" type="tertiary" onClick={props.prev}>
        Back
      </Button>
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
