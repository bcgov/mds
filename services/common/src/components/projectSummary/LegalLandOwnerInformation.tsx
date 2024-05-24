import React, { FC, useEffect, useState } from "react";
import { Col, Row, Typography } from "antd";
import { Field, getFormValues, getFormSyncErrors } from "redux-form";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import {
  email,
  phoneNumber,
  required,
  requiredRadioButton,
  maxLength,
  lat,
  lon,
  max,
  min,
} from "@mds/common/redux/utils/Validate";
import { useSelector } from "react-redux";
import { FORM } from "@mds/common/constants";
import RenderField from "../forms/RenderField";
import { getDropdownMunicipalities } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import { normalizePhone } from "@mds/common/redux/utils/helpers";
import CoreMap from "../common/Map";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";

export const LegalLandOwnerInformation: FC = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const formErrors = useSelector(getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY));

  const {
    is_legal_land_owner = false,
    facility_coords_source,
    facility_latitude,
    facility_longitude,
    legal_land_desc,
    facility_pid_pin_crown_file_no,
  } = formValues;

  const [pin, setPin] = useState<Array<string>>([]);
  const municipalityOptions = useSelector(getDropdownMunicipalities);

  const dataSourceOptions = [
    { value: "GPS", label: "GPS" },
    { value: "SUR", label: "Survey" },
    { value: "GGE", label: "Google Earth" },
    { value: "OTH", label: "Other" },
  ];

  useEffect(() => {
    // don't jump around the map while coords being entered and not yet valid
    const invalidPin = Boolean(formErrors.facility_longitude || formErrors.facility_latitude);
    if (!invalidPin) {
      const latLng = [facility_latitude, facility_longitude];
      setPin(latLng);
    }
  }, [facility_longitude, facility_latitude]);

  return (
    <div className="ant-form-vertical">
      <Typography.Title level={3}>Location, Access and Land Use</Typography.Title>
      <Typography.Title level={5}>Legal Land Owner Information</Typography.Title>
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
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [requiredRadioButton] : []}
                label="Is this federal or provincial Crown land?"
                component={RenderRadioButtons}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="is_landowner_aware_of_discharge_application"
                id="is_landowner_aware_of_discharge_application"
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [requiredRadioButton] : []}
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
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [required] : []}
                help="If it is provincial or federal, write in that"
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="has_landowner_received_copy_of_application"
                id="has_landowner_received_copy_of_application"
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [requiredRadioButton] : []}
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
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [phoneNumber, maxLength(12), required] : []}
                normalize={normalizePhone}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="legal_land_owner_email_address"
                id="legal_land_owner_email_address"
                label="Legal Land Owner Email Address"
                component={RenderField}
                required={!is_legal_land_owner}
                validate={!is_legal_land_owner ? [required, email] : []}
              />
            </Col>
          </Row>
        </>
      )}
      {<Typography.Title level={5}>Access</Typography.Title>}
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="facility_latitude"
            required
            validate={[required, lat, max(60), min(47)]}
            label="Latitude"
            component={RenderField}
            help="Must be between 47 and 60 with no more than 7 decimal places"
          />
          <Field
            name="facility_longitude"
            required
            validate={[required, lon, max(-113), min(-140)]}
            label="Longitude"
            component={RenderField}
            help="Must be between -113 and -140 with no more than 7 decimal places"
          />
          <Field
            name="facility_coords_source"
            required
            validate={[required]}
            label="Source of Data"
            data={dataSourceOptions}
            component={RenderSelect}
          />
        </Col>
        <Col md={12} sm={24}>
          <CoreMap controls additionalPins={[pin]} />
        </Col>
      </Row>
      {facility_coords_source === "OTH" && (
        <Field
          name="facility_coords_source_desc"
          required
          validate={[required, maxLength(4000)]}
          label="Please specify if other"
          maximumCharacters={4000}
          rows={3}
          component={RenderAutoSizeField}
        />
      )}
      <Row>
        <Col md={12} sm={24}>
          <Field
            name="nearest_municipality"
            id="nearest_municipality"
            label="Nearest Municipality to Facility/Site"
            required
            component={RenderSelect}
            data={municipalityOptions}
            validate={[required]}
          />
        </Col>
      </Row>
      <Field
        name="facility_pid_pin_crown_file_no"
        label="PID/PIN/Crown File No"
        component={RenderField}
        validate={!legal_land_desc ? [required, maxLength(100)] : [maxLength(100)]}
        maximumCharacters={100}
        required={!legal_land_desc}
      />
      <Field
        name="legal_land_desc"
        label="Legal land Description (Lot/Block/Plan)"
        validate={!facility_pid_pin_crown_file_no ? [required, maxLength(4000)] : [maxLength(4000)]}
        maximumCharacters={4000}
        rows={3}
        component={RenderAutoSizeField}
        required={!facility_pid_pin_crown_file_no}
      />
      <Field
        name="facility_lease_no"
        label="Mine Lease/Coal Lease Number"
        required
        component={RenderField}
        validate={[required, maxLength(100)]}
      />
    </div>
  );
};
