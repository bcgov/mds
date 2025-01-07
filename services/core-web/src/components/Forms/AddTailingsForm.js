import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required, maxLength, number, lat, lon } from "@mds/common/redux/utils/Validate";
import {
  getConsequenceClassificationStatusCodeDropdownOptions,
  getITRBExemptionStatusCodeDropdownOptions,
  getTSFOperatingStatusCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@mds/common/components/forms/RenderField";
import PartySelectField from "@/components/common/PartySelectField";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

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
  <FormWrapper onSubmit={props.onSubmit}
    initialValues={props.initialValues}
    name={FORM.ADD_TAILINGS}
    reduxFormConfig={{
      touchOnBlur: false,
      enableReinitialize: true,
      onSubmitSuccess: resetForm(FORM.ADD_TAILINGS),
    }}
  >
    <Row gutter={16}>
      <Col span={24}>
        <Field
          id="mine_tailings_storage_facility_name"
          name="mine_tailings_storage_facility_name"
          label="Tailings Storage Facility Name"
          required
          component={RenderField}
          validate={[required]}
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col span={24}>
        <Field
          id="notes"
          name="notes"
          label="Notes"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(300)]}
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Field
          id="latitude"
          name="latitude"
          label="Latitude"
          component={RenderField}
          validate={[number, maxLength(10), lat]}
        />
      </Col>
      <Col md={12} xs={24}>
        <Field
          id="longitude"
          name="longitude"
          label="Longitude"
          component={RenderField}
          validate={[number, maxLength(12), lon]}
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Field
          id="consequence_classification_status_code"
          name="consequence_classification_status_code"
          label="Consequence Classification"
          component={RenderSelect}
          data={props.consequenceClassificationStatusCodeOptions}
        />
      </Col>
      <Col md={12} xs={24}>
        <Field
          id="tsf_operating_status_code"
          label="Operating Status"
          name="tsf_operating_status_code"
          component={RenderSelect}
          data={props.TSFOperatingStatusCodeOptions}
        />
      </Col>
    </Row>
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <PartySelectField
          id="eor_party_guid"
          name="eor_party_guid"
          label="Engineer of Record"
          partyLabel="EoR"
          initialValues={props.initialPartyValue}
          allowNull
          allowAddingParties
        />
      </Col>
      <Col md={12} xs={24}>
        <Field
          id="itrb_exemption_status_code"
          name="itrb_exemption_status_code"
          label="Has Independent Tailings Review Board?"
          component={RenderSelect}
          data={props.itrbExemptionStatusCodeOptions}
        />
      </Col>
    </Row>
    <div className="right center-mobile">
      <RenderCancelButton />
      <RenderSubmitButton buttonText={props.title} />
    </div>
  </FormWrapper>
);

AddTailingsForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    consequenceClassificationStatusCodeOptions: getConsequenceClassificationStatusCodeDropdownOptions(
      state
    ),
    itrbExemptionStatusCodeOptions: getITRBExemptionStatusCodeDropdownOptions(state),
    TSFOperatingStatusCodeOptions: getTSFOperatingStatusCodeDropdownOptions(state),
  }))
)(AddTailingsForm);
