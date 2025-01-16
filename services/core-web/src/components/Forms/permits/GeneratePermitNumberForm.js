import React from "react";
import PropTypes from "prop-types";
import { Col, Row, Alert } from "antd";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

const defaultProps = {
  disabled: false,
};

export const GeneratePermitNumberForm = (props) => (
  <FormWrapper
    isModal
    name={FORM.GENERATE_PERMIT_NUMBER}
    reduxFormConfig={{
      touchOnBlur: true,
    }}
    onSubmit={props.onSubmit}>
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
          <p>You will be able to generate Letter and Permit afterwards.</p>
        </div>
      </Col>
    </Row>
    <div className="right center-mobile">
      <RenderCancelButton />
      <RenderSubmitButton buttonText="Generate Permit Number" disabled={props.disabled} disableOnClean={false} />
    </div>
  </FormWrapper>
);

GeneratePermitNumberForm.propTypes = propTypes;
GeneratePermitNumberForm.defaultProps = defaultProps;

export default GeneratePermitNumberForm;
