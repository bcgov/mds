import React from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { connect } from "react-redux";
import { compose } from "redux";
import { Col, Row } from "antd";
import {
  required,
  maxLength,
  dateNotInFuture,
  dateNotBeforeOther,
  dateNotAfterOther,
} from "@mds/common/redux/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { getExemptionFeeStatusDropDownOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  title: PropTypes.string.isRequired,
  formValues: PropTypes.objectOf(PropTypes.any),
  exemptionFeeStatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
};

const defaultProps = {
  formValues: {},
};

export const IssuePermitForm = (props) => {
  return (
    <FormWrapper
      name={FORM.ISSUE_PERMIT}
      isModal
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
      onSubmit={props.onSubmit}
      initialValues={props.initialValues}
    >
      <Row>
        <Col span={24}>
          <Field
            id="issue_date"
            name="issue_date"
            label="Issue Date"
            component={renderConfig.DATE}
            required
            validate={[
              required,
              dateNotInFuture,
              dateNotAfterOther(props.formValues.auth_end_date),
            ]}
          />
          <Field
            id="auth_end_date"
            name="auth_end_date"
            label="Authorization End Date"
            component={renderConfig.DATE}
            required
            validate={[required, dateNotBeforeOther(props.formValues.issue_date)]}
          />
          <Field
            id="description"
            name="description"
            label="Description"
            component={renderConfig.FIELD}
          />
          <Field
            id="exemption_fee_status_code"
            name="exemption_fee_status_code"
            label="Is this mine exempted from filing inspection fees?"
            placeholder="Inspection Fee Status will be automatically populated."
            component={renderConfig.SELECT}
            disabled
            data={props.exemptionFeeStatusDropDownOptions}
          />
          <Field
            id="exemption_fee_status_note"
            name="exemption_fee_status_note"
            label="Fee Exemption Note"
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[maxLength(300)]}
          />
        </Col>
      </Row>
      <div className="right center-mobile">
        <RenderCancelButton />
        <RenderSubmitButton buttonText={props.title} disableOnClean={false} />
      </div>
    </FormWrapper>
  );
};

IssuePermitForm.propTypes = propTypes;
IssuePermitForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    formValues: getFormValues(FORM.ISSUE_PERMIT)(state),
    exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
  }))
)(IssuePermitForm);
