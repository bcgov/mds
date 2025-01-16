import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Row, Col } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  layer: PropTypes.number.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const placeHolderText = (type) =>
({
  SEC: "Sub-Section Name",
  CON: "Type a condition",
  LIS: "Type a list item",
}[type]);

export const ConditionForm = (props) => {
  const formSpan = 21 - props.layer;
  return (
    <Row gutter={[16, 24]}>
      <Col span={props.layer} />
      <Col span={formSpan}>
        <FormWrapper
          name={FORM.CONDITION_SECTION}
          reduxFormConfig={{
            onSubmitSuccess: resetForm(FORM.CONDITION_SECTION),
          }}
          initialValues={props.initialValues}
          onSubmit={props.onSubmit}
        >
          <Field
            id="condition"
            name="condition"
            placeholder={placeHolderText(props.initialValues.condition_type_code)}
            required
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[required]}
          />
          <div className="right center-mobile">
            <RenderCancelButton cancelFunction={props.onCancel} />
            <RenderSubmitButton buttonText="Save" />
          </div>
        </FormWrapper>
      </Col>
      <Col span={3} />
    </Row>
  );
};

ConditionForm.propTypes = propTypes;

export default ConditionForm;
