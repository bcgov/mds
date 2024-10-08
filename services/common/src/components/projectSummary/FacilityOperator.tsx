import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Col, Row, Typography } from "antd";
import { Field, getFormValues } from "redux-form";
import {
  email,
  maxLength,
  phoneNumber,
  postalCodeWithCountry,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import RenderField from "../forms/RenderField";
import RenderSelect from "../forms/RenderSelect";
import { FORM, isFieldDisabled } from "../..";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderRadioButtons from "../forms/RenderRadioButtons";
import RenderAutoSizeField from "../forms/RenderAutoSizeField";
import { normalizePhone } from "@mds/common/redux/utils/helpers";
import { getRegionOptions } from "@mds/common/redux/slices/regionsSlice";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";

export const FacilityOperator: FC = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const systemFlag = useSelector(getSystemFlag);

  const { zoning } = formValues;

  const regionOptions = useSelector(getRegionOptions);

  const address_type_code = "CAN";

  const provinceOptions = useSelector(getDropdownProvinceOptions).filter(
    (p) => p.subType === address_type_code
  );

  return (
    <>
      <Typography.Title level={3}>Mine Components and Offsite Infrastructure</Typography.Title>
      <Field
        name="facility_type"
        required
        validate={[required, maxLength(4000)]}
        label="Facility Type"
        labelSubtitle="List the proposed facility type and/or mining activity."
        component={RenderField}
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
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
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
      />
      <Row className="margin-large--bottom">
        <Col span={12}>
          <Field
            name="regional_district_id"
            required
            validate={[required]}
            label="Facility's Regional Location"
            component={RenderSelect}
            data={regionOptions}
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
          />
        </Col>
      </Row>
      <Typography.Title level={5}>Facility Address</Typography.Title>
      <Row gutter={16}>
        <Col md={19} sm={24}>
          <Field
            name="facility_operator.address.address_line_1"
            label="Street"
            required
            validate={[required, maxLength(60)]}
            component={RenderField}
            help="If no civic address, describe location (e.g. 3km north of Sechelt, BC, on Highway 101)"
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
          />
        </Col>
        <Col md={5} sm={24}>
          <Field
            validate={[maxLength(20)]}
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.address.suite_no"
            label="Unit #"
            component={RenderField}
          />
        </Col>
      </Row>
      <Field
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
        name="facility_operator.address.city"
        label="City"
        required
        validate={[required, maxLength(100)]}
        component={RenderField}
      />
      <Field
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
        name="facility_operator.address.sub_division_code"
        label="Province"
        required
        validate={[required]}
        data={provinceOptions}
        component={RenderSelect}
      />
      <Field
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
        name="facility_operator.address.post_code"
        label="Postal Code"
        component={RenderField}
        validate={[postalCodeWithCountry(address_type_code), maxLength(10)]}
      />

      <Field
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
        name="zoning"
        label="Is appropriate zoning in place for this facility?"
        required
        validate={[requiredRadioButton]}
        component={RenderRadioButtons}
      />
      {zoning === false && (
        <Field
          disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
          name="zoning_reason"
          label="If no, state the reason"
          required
          validate={[required, maxLength(4000)]}
          component={RenderField}
        />
      )}
      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.first_name"
            label="Facility Operator First Name"
            required
            validate={[required, maxLength(100)]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.party_name"
            label="Last Name"
            required
            validate={[required, maxLength(100)]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.job_title"
            label="Facility Operator Title"
            validate={[maxLength(100)]}
            component={RenderField}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={8} sm={19}>
          <Field
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.phone_no"
            label="Facility Operator Contact Number"
            required
            validate={[phoneNumber, maxLength(12), required]}
            component={RenderField}
            normalize={normalizePhone}
          />
        </Col>
        <Col md={4} sm={5}>
          <Field
            name="facility_operator.phone_ext"
            validate={[maxLength(4)]}
            label="Ext."
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
            name="facility_operator.email"
            label="Facility Operator Email Address"
            validate={[email, maxLength(100)]}
            component={RenderField}
          />
        </Col>
      </Row>
    </>
  );
};
