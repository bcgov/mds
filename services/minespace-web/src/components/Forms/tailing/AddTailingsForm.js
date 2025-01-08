import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field } from "redux-form";
import {
  required,
  maxLength,
  number,
  lat,
  lonNegative,
  lon,
} from "@mds/common/redux/utils/Validate";
import {
  getConsequenceClassificationStatusCodeDropdownOptions,
  getITRBExemptionStatusCodeDropdownOptions,
  getTSFOperatingStatusCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  initialPartyValue: PropTypes.objectOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
  consequenceClassificationStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  itrbExemptionStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  TSFOperatingStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddTailingsForm = (props) => (
  <FormWrapper
    name={FORM.ADD_TAILINGS}
    initialValues={props.initialValues}
    isModal
    onSubmit={props.onSubmit}
    reduxFormConfig={{
      touchOnBlur: false,
      enableReinitialize: true,
    }}
  >
    <Field
      id="mine_tailings_storage_facility_name"
      name="mine_tailings_storage_facility_name"
      label="Tailings Storage Facility Name"
      component={RenderField}
      required
      validate={[required]}
    />
    <Field
      id="latitude"
      name="latitude"
      label="Latitude"
      component={RenderField}
      required
      validate={[number, maxLength(10), lat, required]}
    />
    <Field
      id="longitude"
      name="longitude"
      label="Longitude"
      component={RenderField}
      required
      validate={[number, maxLength(12), lon, lonNegative, required]}
    />
    <Field
      id="consequence_classification_status_code"
      name="consequence_classification_status_code"
      label="Consequence Classification"
      component={RenderSelect}
      data={props.consequenceClassificationStatusCodeOptions}
      required
      validate={[required]}
    />
    <Field
      id="tsf_operating_status_code"
      label="Operating Status"
      name="tsf_operating_status_code"
      component={RenderSelect}
      data={props.TSFOperatingStatusCodeOptions}
      required
      validate={[required]}
    />
    <Field
      id="itrb_exemption_status_code"
      name="itrb_exemption_status_code"
      label="Has Independent Tailings Review Board?"
      component={RenderSelect}
      data={props.itrbExemptionStatusCodeOptions}
      required
      validate={[required]}
    />
    <Field
      id="notes"
      name="notes"
      label="Notes"
      data={props.notes}
      component={renderConfig.AUTO_SIZE_FIELD}
      validate={[maxLength(300)]}
    />
    <div className="ant-modal-footer">
      <RenderCancelButton />
      <RenderSubmitButton buttonText={props.title} />
    </div>
  </FormWrapper>
);

AddTailingsForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    consequenceClassificationStatusCodeOptions:
      getConsequenceClassificationStatusCodeDropdownOptions(state),
    itrbExemptionStatusCodeOptions: getITRBExemptionStatusCodeDropdownOptions(state),
    TSFOperatingStatusCodeOptions: getTSFOperatingStatusCodeDropdownOptions(state),
  }))
)(AddTailingsForm);
