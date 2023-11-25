import React from "react";
import PropTypes from "prop-types";
import { compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm } from "antd";
import { required, maxLength, number, lat, lonNegative, lon } from "@common/utils/Validate";
import {
  getConsequenceClassificationStatusCodeDropdownOptions,
  getITRBExemptionStatusCodeDropdownOptions,
  getTSFOperatingStatusCodeDropdownOptions,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { resetForm } from "@common/utils/helpers";
import RenderField from "@/components/common/RenderField";
import RenderSelect from "@/components/common/RenderSelect";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  initialPartyValue: PropTypes.objectOf(PropTypes.any).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  consequenceClassificationStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem)
    .isRequired,
  itrbExemptionStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  TSFOperatingStatusCodeOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export const AddTailingsForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Field
      id="mine_tailings_storage_facility_name"
      name="mine_tailings_storage_facility_name"
      label="Tailings Storage Facility Name"
      component={RenderField}
      validate={[required]}
    />
    <Field
      id="latitude"
      name="latitude"
      label="Latitude"
      component={RenderField}
      validate={[number, maxLength(10), lat, required]}
    />
    <Field
      id="longitude"
      name="longitude"
      label="Longitude"
      component={RenderField}
      validate={[number, maxLength(12), lon, lonNegative, required]}
    />
    <Field
      id="consequence_classification_status_code"
      name="consequence_classification_status_code"
      label="Consequence Classification"
      component={RenderSelect}
      data={props.consequenceClassificationStatusCodeOptions}
      validate={[required]}
    />
    <Field
      id="tsf_operating_status_code"
      label="Operating Status"
      name="tsf_operating_status_code"
      component={RenderSelect}
      data={props.TSFOperatingStatusCodeOptions}
      validate={[required]}
    />
    <Field
      id="itrb_exemption_status_code"
      name="itrb_exemption_status_code"
      label="Has Independent Tailings Review Board?"
      component={RenderSelect}
      data={props.itrbExemptionStatusCodeOptions}
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
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
        disabled={props.submitting}
      >
        <Button className="secondary" type="secondary" disabled={props.submitting}>
          Cancel
        </Button>
      </Popconfirm>
      <Button className="primary" type="primary" htmlType="submit" loading={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

AddTailingsForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    consequenceClassificationStatusCodeOptions: getConsequenceClassificationStatusCodeDropdownOptions(
      state
    ),
    itrbExemptionStatusCodeOptions: getITRBExemptionStatusCodeDropdownOptions(state),
    TSFOperatingStatusCodeOptions: getTSFOperatingStatusCodeDropdownOptions(state),
  })),
  reduxForm({
    form: FORM.ADD_TAILINGS,
    touchOnBlur: false,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.ADD_TAILINGS),
  })
)(AddTailingsForm);
