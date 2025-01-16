import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row, Typography } from "antd";
import { dateTimezoneRequired, dateNotInFutureTZ, required } from "@mds/common/redux/utils/Validate";
import { normalizeDatetime } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderDateTimeTz from "@mds/common/components/forms/RenderDateTimeTz";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
};

export const ExplosivesPermitCloseForm = (props) => {
  return (
    <FormWrapper onSubmit={props.onSubmit}
      initialValues={props.initialValues}
      isModal
      name={FORM.EXPLOSIVES_PERMIT_CLOSE}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
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
        <RenderCancelButton />
        <RenderSubmitButton buttonText="Close Permit" />
      </div>
    </FormWrapper>
  );
};

ExplosivesPermitCloseForm.propTypes = propTypes;

export default ExplosivesPermitCloseForm;
