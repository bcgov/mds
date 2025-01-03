import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row, Popconfirm, Typography } from "antd";
import { dateTimezoneRequired, dateNotInFutureTZ, required } from "@mds/common/redux/utils/Validate";
import { resetForm, normalizeDatetime } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderDateTimeTz from "@mds/common/components/forms/RenderDateTimeTz";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const ExplosivesPermitCloseForm = (props) => {
  return (
    <FormWrapper onSubmit={props.onSubmit}
      name={FORM.EXPLOSIVES_PERMIT_CLOSE}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
        onSubmitSuccess: resetForm(FORM.EXPLOSIVES_PERMIT_CLOSE),
      }}
    >
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
          <Field
            label="Date Permit was Closed"
            id="closed_timestamp"
            name="closed_timestamp"
            normalize={normalizeDatetime}
            component={RenderDateTimeTz}
            required
            validate={[
              dateNotInFutureTZ,
              required,
              dateTimezoneRequired("esup_permit_close_timezone"),
            ]}
            props={{ timezoneFieldProps: { name: "esup_permit_close_timezone" } }}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="closed_reason"
            name="closed_reason"
            label="Reason for closure"
            component={RenderAutoSizeField}
          />
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
    </FormWrapper>
  );
};

ExplosivesPermitCloseForm.propTypes = propTypes;

export default ExplosivesPermitCloseForm;
