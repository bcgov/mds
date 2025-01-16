import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, formValueSelector, change } from "redux-form";
import { Col, Row } from "antd";
import {
  currency,
  required,
  assessedLiabilityNegativeWarning,
} from "@mds/common/redux/utils/Validate";
import { currencyMask } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { securityNotRequiredReasonOptions } from "@/constants/NOWConditions";
import { CoreTooltip } from "@/components/common/CoreTooltip";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderDate from "@mds/common/components/forms/RenderDate";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  isEditMode: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  securityNotRequired: PropTypes.bool.isRequired,
};

export const PermitAmendmentSecurityForm = (props) => {
  const formName = FORM.EDIT_PERMIT;

  const handleChange = (value) => {
    if (value) {
      props.change(formName, "security_not_required_reason", null);
    } else {
      props.change(formName, "liability_adjustment", null);
      props.change(formName, "security_received_date", null);
    }
  };

  return (
    <FormWrapper onSubmit={props.onSubmit} initialValues={props.initialValues}
      name={FORM.EDIT_PERMIT}
      reduxFormConfig={{
        touchOnBlur: true,
        enableReinitialize: true,
      }}
    >
      <Row gutter={16}>
        <Col span={12}>
          <div className="field-title">
            Security Not Required
            <CoreTooltip title="This only applies if a prior security is held covering this application and no increase is required, or another agency holds the bond." />
          </div>
          <Field
            id="security_not_required"
            name="security_not_required"
            component={RenderCheckbox}
            label="No increase required"
            disabled={!props.isEditMode}
            onChange={(e) => handleChange(e)}
          />
        </Col>
        <Col span={12}>
          <Field
            id="security_not_required_reason"
            name="security_not_required_reason"
            label="Reason"
            required={props.securityNotRequired}
            component={RenderSelect}
            placeholder="Please select a reason"
            data={securityNotRequiredReasonOptions}
            validate={
              !props.securityNotRequired
                ? []
                : [required]
            }
            disabled={!props.isEditMode || !props.securityNotRequired}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <div className="field-title">
            Assessed Liability Adjustment
            <CoreTooltip title="Amount assessed for this application will be added to the total assessed liability amount on the permit." />
          </div>
          <Field
            id="liability_adjustment"
            name="liability_adjustment"
            component={RenderField}
            disabled={!props.isEditMode || props.securityNotRequired}
            allowClear
            {...currencyMask}
            validate={[currency]}
            warn={[assessedLiabilityNegativeWarning]}
          />
        </Col>
        <Col md={12} sm={24}>
          <div className="field-title">
            Security Received
            <CoreTooltip title="Do not mark as received until the security amount is paid in full." />
          </div>
          <Field
            id="security_received_date"
            name="security_received_date"
            component={RenderDate}
            disabled={!props.isEditMode || props.securityNotRequired}
          />
        </Col>
      </Row>
      {props.isEditMode && (
        <div className="right center-mobile">
          <RenderCancelButton cancelFunction={props.onCancel} />
          <RenderSubmitButton buttonText="Save" />
        </div>
      )}
    </FormWrapper>
  );
};

PermitAmendmentSecurityForm.propTypes = propTypes;

const selector = formValueSelector(FORM.EDIT_PERMIT); // <-- same as form name
const mapStateToProps = (state) => ({
  securityNotRequired: selector(state, "security_not_required"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps)
)(PermitAmendmentSecurityForm);
