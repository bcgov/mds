import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
import { dateTimezoneRequired, dateNotInFutureTZ, required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import RenderDateTimeTz from "@/components/common/RenderDateTimeTz";
import { normalizeDatetime } from "@common/utils/helpers";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
};

export const ExplosivesPermitCloseForm = (props) => {
  return (
    <Form layout="vertical" onSubmit={props.handleSubmit}>
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Title level={2}>Close Permit</Typography.Title>
          <Typography.Paragraph>
            If you perform this action there will no longer be an active explosive use and storage
            permit for this notice of work. If you still want to have an amendment active, consider
            creating an amendment for this permit before performing this action.
          </Typography.Paragraph>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item label="Date Permit was Closed" required>
            <Field
              id="closed_timestamp"
              name="closed_timestamp"
              normalize={normalizeDatetime}
              component={RenderDateTimeTz}
              validate={[
                dateNotInFutureTZ,
                required,
                dateTimezoneRequired("esup_permit_close_timezone"),
              ]}
              props={{ timezoneFieldProps: { name: "esup_permit_close_timezone" } }}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Form.Item>
            <Field
              id="closed_reason"
              name="closed_reason"
              label="Reason for closure"
              component={RenderAutoSizeField}
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
          disabled={props.submitting}
        >
          <Button className="full-mobile" type="secondary" disabled={props.submitting}>
            Cancel
          </Button>
        </Popconfirm>
        <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
          Close Permit
        </Button>
      </div>
    </Form>
  );
};

ExplosivesPermitCloseForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EXPLOSIVES_PERMIT_CLOSE,
  touchOnBlur: false,
  enableReinitialize: true,
  onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_CLOSE),
})(ExplosivesPermitCloseForm);
