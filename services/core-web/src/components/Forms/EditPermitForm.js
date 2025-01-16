import React, { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { compose } from "redux";
import PropTypes from "prop-types";
import { getFormValues, Field, change } from "redux-form";
import { Col, Row } from "antd";
import { currency, required, maxLength } from "@mds/common/redux/utils/Validate";
import { determineExemptionFeeStatus, currencyMask } from "@common/utils/helpers";
import {
  getDropdownPermitStatusOptions,
  getExemptionFeeStatusDropDownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import * as FORM from "@/constants/forms";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";

import CustomPropTypes from "@/customPropTypes";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  initialValues: CustomPropTypes.permit.isRequired,
  exemptionFeeStatusDropDownOptions: PropTypes.objectOf(CustomPropTypes.options).isRequired,
};

export const EditPermitForm = (props) => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.EDIT_PERMIT)) ?? {};

  useEffect(() => {
    const isExploration = props.initialValues.permit_no.charAt(1) === "X";
    const feeStatus = determineExemptionFeeStatus(
      formValues?.permit_status_code,
      props.initialValues.permit_prefix,
      props.initialValues.site_properties?.mine_tenure_type_code,
      isExploration,
      props.initialValues.site_properties?.mine_disturbance_code
    );
    dispatch(change("exemption_fee_status_code", feeStatus));
  }, [formValues?.permit_status_code]);

  return (
    <FormWrapper onSubmit={props.onSubmit}
      isModal
      initialValues={props.initialValues}
      name={FORM.EDIT_PERMIT}
      reduxFormConfig={{
        touchOnBlur: false,
        enableReinitialize: true,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="permit_status_code"
            name="permit_status_code"
            label="Permit status"
            placeholder="Select a permit status"
            component={RenderSelect}
            data={props.permitStatusOptions}
            required
            validate={[required]}
          />
          {(formValues.permit_status_code === "C" ||
            formValues.remaining_static_liability !== null) && (
              <Field
                id="remaining_static_liability"
                name="remaining_static_liability"
                label="Remaining outstanding liability amount (if any)"
                placeholder="$0.00"
                {...currencyMask}
                component={RenderField}
                validate={[currency]}
              />
            )}
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_code"
            name="exemption_fee_status_code"
            label="Inspection Fee Status"
            placeholder="Inspection Fee Status will be automatically populated."
            showOptional={false}
            component={RenderSelect}
            disabled
            data={props.exemptionFeeStatusDropDownOptions}
          />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Field
            id="exemption_fee_status_note"
            name="exemption_fee_status_note"
            label="Fee Exemption Note"
            component={RenderAutoSizeField}
            validate={[maxLength(300)]}
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

EditPermitForm.propTypes = propTypes;

const mapStateToProps = (state) => ({
  permitStatusOptions: getDropdownPermitStatusOptions(state),
  exemptionFeeStatusDropDownOptions: getExemptionFeeStatusDropDownOptions(state),
});

export default compose(
  connect(mapStateToProps)
)(EditPermitForm);
