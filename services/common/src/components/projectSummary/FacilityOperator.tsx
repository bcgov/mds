import React, { FC, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import { Field, getFormValues, getFormSyncErrors } from "redux-form";
import {
  email,
  maxLength,
  phoneNumber,
  postalCodeWithCountry,
  required,
  requiredRadioButton,
  lat,
  lon,
  max,
  min,
} from "@mds/common/redux/utils/Validate";
import RenderField from "../forms/RenderField";
import RenderSelect from "../forms/RenderSelect";
import { FORM } from "../..";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";
import CoreMap from "../common/Map";

export const FacilityOperator: FC = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const formErrors = useSelector(getFormSyncErrors(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { facility_coords_source, zoning, facility_latitude, facility_longitude } = formValues;
  const [pin, setPin] = useState<Array<string>>([]);

  useEffect(() => {
    // don't jump around the map while coords being entered and not yet valid
    const invalidPin = Boolean(formErrors.facility_longitude || formErrors.facility_latitude);
    if (!invalidPin) {
      const latLng = [facility_latitude, facility_longitude];
      setPin(latLng);
    }
  }, [facility_longitude, facility_latitude]);

  const dataSourceOptions = [
    { value: "GPS", label: "GPS" },
    { value: "SUR", label: "Survey" },
    { value: "GGE", label: "Google Earth" },
    { value: "OTH", label: "Other" },
  ];

  const address_type_code = "CAN";

  const provinceOptions = useSelector(getDropdownProvinceOptions).filter(
    (p) => p.subType === address_type_code
  );

  return (
    <>
      <Typography.Title level={3}>Facility Location and Operator Information</Typography.Title>
      <Field
        name="facility_type"
        required
        validate={[required]}
        label="Facility Type"
        labelSubtitle="List the proposed facility type and/or mining activity."
        component={RenderField}
      />
      <Field
        name="facility_desc"
        required
        validate={[required, maxLength(4000)]}
        label="Facility Description"
        labelSubtitle="Briefly describe: Overview of the project. The primary activity of the facility. If there is not enough space, you may attach additional information, including conceptual site plans."
        maximumCharacters={4000}
        rows={3}
        component={RenderAutoSizeField}
        help="Briefly describe: Overview of the project. The primary activity of the facility. If there is not enough space, you may attach additional information, including conceptual site plans."
      />
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
      <Field
        name="facility_pid_pin_crown_file_no"
        label="PID/PIN/Crown File No"
        component={RenderField}
      />
      <Field
        name="legal_land_desc"
        label="Legal land Description (Lot/Block/Plan)"
        validate={[maxLength(4000)]}
        maximumCharacters={4000}
        rows={3}
        component={RenderAutoSizeField}
      />
      <Field
        name="facility_lease_no"
        label="Mine Lease/Coal Lease Number"
        component={RenderField}
      />

      <Typography.Title level={4}>Facility Address</Typography.Title>
      <Row gutter={16}>
        <Col md={19} sm={24}>
          <Field
            name="facility_operator.address.address_line_1"
            label="Street"
            required
            validate={[required]}
            component={RenderField}
            help="If no civic address, describe location (e.g. 3km north of Sechelt, BC, on Highway 101)"
          />
        </Col>
        <Col md={5} sm={24}>
          <Field name="facility_operator.address.suite_no" label="Unit #" component={RenderField} />
        </Col>
      </Row>
      <Field
        name="facility_operator.address.city"
        label="City"
        required
        validate={[required]}
        component={RenderField}
      />
      <Field
        name="facility_operator.address.sub_division_code"
        label="Province"
        required
        validate={[required]}
        data={provinceOptions}
        component={RenderSelect}
      />
      <Field
        name="facility_operator.address.post_code"
        label="Postal Code"
        component={RenderField}
        required
        validate={[postalCodeWithCountry(address_type_code), required]}
      />

      <Field
        name="zoning"
        label="Is appropriate zoning in place for this facility?"
        required
        validate={[requiredRadioButton]}
        component={RenderRadioButtons}
      />
      {zoning === false && (
        <Field
          name="zoning_reason"
          label="If no, state the reason"
          required
          validate={[required]}
          component={RenderField}
        />
      )}
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="facility_operator.first_name"
            label="Facility Operator First Name"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="facility_operator.party_name"
            label="Last Name"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="facility_operator.job_title"
            label="Facility Operator Title"
            component={RenderField}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={8} sm={19}>
          <Field
            name="facility_operator.phone_no"
            label="Facility Operator Contact Number"
            required
            validate={[required, phoneNumber]}
            component={RenderField}
          />
        </Col>
        <Col md={4} sm={5}>
          <Field name="facility_operator.phone_ext" label="Ext." component={RenderField} />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="facility_operator.email"
            label="Facility Operator Email Address"
            validate={[email]}
            component={RenderField}
          />
        </Col>
      </Row>
    </>
  );
};
