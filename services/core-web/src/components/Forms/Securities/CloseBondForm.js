import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import {
  required,
  date,
  dateNotInFuture,
  maxLength,
  dateNotBeforeOther,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderField from "@mds/common/components/forms/RenderField";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  bond: CustomPropTypes.bond.isRequired,
  bondStatusCode: PropTypes.string.isRequired,
  bondStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const CloseBondForm = (props) => {
  const bondStatusDescription = props.bondStatusOptionsHash[props.bondStatusCode];
  return (
    <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
      name={FORM.CLOSE_BOND}
      isModal
      reduxFormConfig={{
        enableReinitialize: true,
        touchOnBlur: false,
      }}
    >
      <Row>
        <Col span={24}>
          {props.bondStatusCode === "CON" && (
            <Field
              id="project_id"
              name="project_id"
              label="Project Id"
              required
              showTime
              component={RenderField}
              validate={[required]}
            />
          )}
          <Field
            id="closed_date"
            name="closed_date"
            label={`${bondStatusDescription} Date`}
            required
            showTime
            component={RenderDate}
            validate={[
              required,
              date,
              dateNotInFuture,
              dateNotBeforeOther(props.bond.issue_date),
            ]}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Field
            id="closed_note"
            name="closed_note"
            label={`${bondStatusDescription} Notes`}
            component={RenderAutoSizeField}
            validate={[maxLength(4000)]}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} />
      </div>
    </FormWrapper>
  );
};

CloseBondForm.propTypes = propTypes;

export default CloseBondForm;
