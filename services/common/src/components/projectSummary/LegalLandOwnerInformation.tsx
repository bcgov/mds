import React from "react";
import { FC } from "react";
import { Col, Row, Typography } from "antd";
import { Field, getFormValues } from "redux-form";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import {
  email,
  maxLength,
  phoneNumber,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import { useSelector } from "react-redux";
import { FORM } from "@mds/common";
import RenderField from "../forms/RenderField";

export const LegalLandOwnerInformation: FC = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));

  const { is_legal_land_owner = false } = formValues;

  return (
    <div className="ant-form-vertical">
      <Typography.Title level={3}>Legal Land Owner Information</Typography.Title>
      <Field
        name="is_legal_land_owner"
        id="is_legal_land_owner"
        required
        validate={[requiredRadioButton]}
        label="Is the Applicant the Legal Land Owner?"
        component={RenderRadioButtons}
      />

      {!is_legal_land_owner && (
        <>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="is_crown_land_federal_or_provincial"
                id="is_crown_land_federal_or_provincial"
                required
                validate={[requiredRadioButton]}
                label="Is this federal or provincial Crown land?"
                component={RenderRadioButtons}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="is_landowner_aware_of_discharge_application"
                id="is_landowner_aware_of_discharge_application"
                required
                validate={[requiredRadioButton]}
                label="Is the Legal Land Owner aware of the proposed application to discharge waste?"
                component={RenderRadioButtons}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="legal_land_owner_name"
                id="legal_land_owner_name"
                label="Legal Land Owner Name"
                component={RenderField}
                validate={[required]}
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="has_landowner_received_copy_of_application"
                id="has_landowner_received_copy_of_application"
                required
                validate={[requiredRadioButton]}
                label="Has the Legal Land Owner received a copy of this application?"
                component={RenderRadioButtons}
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="legal_land_owner_contact_number"
                id="legal_land_owner_contact_number"
                label="Legal Land Owner Contact Number"
                component={RenderField}
                validate={[required, phoneNumber]}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="legal_land_owner_email_address"
                id="legal_land_owner_email_address"
                label="Legal Land Owner Email Address"
                component={RenderField}
                validate={[required, email]}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
