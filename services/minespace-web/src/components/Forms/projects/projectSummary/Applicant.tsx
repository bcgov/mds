import { Col, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, getFormValues, change } from "redux-form";
import {
  email,
  maxLength,
  phoneNumber,
  postalCodeWithCountry,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { FORM, IOrgbookCredential } from "@mds/common";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleX, faSpinner } from "@fortawesome/pro-light-svg-icons";
import { isEmpty } from "lodash";
import { verifyOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";
import RenderField from "@mds/common/components/forms/RenderField";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderSelect from "@mds/common/components/forms/RenderSelect";

const { Title, Paragraph } = Typography;

const Applicant = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [verified, setVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { applicant = {}, applicant_type = "" } = formValues;
  const {
    address = {},
    is_legal_address_same_as_mailing_address = false,
    is_billing_address_same_as_mailing_address = false,
    is_billing_address_same_as_legal_address = false,
  } = applicant ?? {};
  const { address_type_code, sub_division_code } = address ?? {};
  const isInternational = address_type_code === "INT";
  const provinceOptions = useSelector(getDropdownProvinceOptions);

  const countryOptions = [
    { value: "CAN", label: "Canada" },
    { value: "USA", label: "United States" },
    { value: "INT", label: "International" },
  ];

  useEffect(() => {
    // clear out the province if country has changed and it no longer matches
    const selectedProvince = sub_division_code
      ? provinceOptions.find((p) => p.value === sub_division_code)
      : {};
    if (address_type_code === "INT" || selectedProvince?.subType !== address_type_code) {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.address.sub_division_code", null));
    }
  }, [address_type_code]);

  useEffect(() => {
    setVerified(false);
    setCheckingStatus(true);
    if (credential) {
      dispatch(verifyOrgBookCredential(credential.id)).then((response) => {
        setVerified(response.success);
        setCheckingStatus(false);
      });
      const businessName = credential.local_name ? credential.local_name.text : null;
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "company_legal_name", businessName));
      const incorporationNumber = credential.topic.source_id ? credential.topic.source_id : null;
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "incorporation_number", incorporationNumber));
    }
  }, [credential]);

  useEffect(() => {
    setCredential(null);
  }, [applicant_type]);

  useEffect(() => {
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant_type", "ORG"));
  }, []);

  const findBusinessNumber = (obj: any): string => {
    // Check if the object is a dictionary and has a "type" field with value of "business_number"
    if (
      typeof obj === "object" &&
      obj !== null &&
      Object.prototype.hasOwnProperty.call(obj, "type") &&
      obj.type === "business_number"
    ) {
      return obj.text;
    }

    // Iterate over all keys of the object, go deeper if the value is an object itself or an array
    for (const key in obj) {
      if (typeof obj[key] === "object" && obj[key] !== null) {
        const result = findBusinessNumber(obj[key]);

        // return the result if 'result' is not null
        if (result) {
          return result;
        }
      }
    }
    // Return '-' if no business_number is found
    return "-";
  };

  const renderStatus = () => {
    let icon = faSpinner;
    let color = undefined;
    let text = undefined;

    if (!checkingStatus) {
      if (verified) {
        icon = faCircleCheck;
        color = "#45A766";
        text = "Verified on Orgbook BC";
      } else {
        icon = faCircleX;
        color = "#D8292F";
        text = "Not registered on Orgbook BC";
      }
    }

    return (
      <Paragraph strong className="light">
        <FontAwesomeIcon
          size="lg"
          color={color}
          icon={icon}
          spin={checkingStatus}
          className="margin-medium--right"
        />
        {text}
      </Paragraph>
    );
  };

  return (
    <div className="ant-form-vertical">
      <Title level={3}>Applicant Information</Title>
      <Paragraph>This must be the name of the company or person seeking authorization.</Paragraph>
      <Field
        name="applicant_type"
        id="applicant_type"
        required
        validate={[requiredRadioButton]}
        label="Applicant Type"
        component={RenderRadioButtons}
        defaultValue={"ORG"}
        customOptions={[
          { label: "Company", value: "ORG" },
          {
            label: "Individual",
            value: "IND",
          },
        ]}
        optionType="button"
      />
      {applicant_type === "ORG" && (
        <div>
          <Field
            name="applicant.party_name"
            id="applicant.party_name"
            required
            validate={[required]}
            label="Company Legal Name"
            setCredential={setCredential}
            component={OrgBookSearch}
            help={"as registered with the BC Registar of Companies"}
          />
          {!isEmpty(credential) && (
            <>
              <div className="table-summary-card">
                {renderStatus()}
                {findBusinessNumber(credential) !== "-" && (
                  <Paragraph className="light margin-none">
                    Business Number: {findBusinessNumber(credential)}
                  </Paragraph>
                )}
                <Paragraph className="light margin-none">
                  BC Registries ID: {credential.id}
                </Paragraph>
                <Paragraph className="light margin-none">
                  BC Registration Status {credential.inactive ? "Inactive" : "Active"}
                </Paragraph>
              </div>
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <Field
                    id="applicant.company_alias"
                    name="applicant.company_alias"
                    label="Doing Business As"
                    component={RenderField}
                  />
                </Col>

                <Col md={12} sm={24}>
                  <Field
                    id="incorporation_number"
                    name="incorporation_number"
                    label="Incorporation Number"
                    required
                    validate={[required]}
                    component={RenderField}
                  />
                </Col>
              </Row>
            </>
          )}
        </div>
      )}
      {applicant_type === "IND" && (
        <Row gutter={16}>
          <Col md={8} sm={24}>
            <Field
              name="applicant.first_name"
              label="First Name"
              required
              validate={[required]}
              component={RenderField}
            />
          </Col>
          <Col md={8} sm={24}>
            <Field name="middle_name" label="Middle Name" component={RenderField} />
          </Col>
          <Col md={8} sm={24}>
            <Field
              name="applicant.last_name"
              label="Last Name"
              required
              validate={[required]}
              component={RenderField}
            />
          </Col>
        </Row>
      )}
      <Row gutter={16}>
        <Col md={8} sm={19}>
          <Field
            name="applicant.phone_no"
            label="Contact Number"
            required
            validate={isInternational ? [required] : [required, phoneNumber]}
            component={RenderField}
          />
        </Col>
        <Col md={4} sm={5}>
          <Field name="applicant.phone_ext" label="Ext." component={RenderField} />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="applicant.email"
            label="Email Address"
            required
            validate={[required, email]}
            component={RenderField}
          />
        </Col>
      </Row>
      <Typography.Title level={4}>Mailing Address</Typography.Title>
      <Row gutter={16}>
        <Col md={19} sm={24}>
          <Field
            name="applicant.address.address_line_1"
            label="Street"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={5} sm={24}>
          <Field name="applicant.address.suite_no" label="Unit #" component={RenderField} />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address.address_type_code"
            label="Country"
            required
            validate={[required]}
            data={countryOptions}
            component={RenderSelect}
          />
        </Col>

        <Col md={12} sm={24}>
          <Field
            name="applicant.address.sub_division_code"
            label="Province"
            required={!isInternational}
            data={provinceOptions.filter((p) => p.subType === address_type_code)}
            validate={!isInternational ? [required] : []}
            component={RenderSelect}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address.city"
            label="City"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address.post_code"
            label="Postal Code"
            component={RenderField}
            validate={[postalCodeWithCountry(address_type_code), maxLength(10)]}
          />
        </Col>
      </Row>
      <Typography.Title level={4}>Legal Address</Typography.Title>
      {is_legal_address_same_as_mailing_address && (
        <>
          <Row gutter={16}>
            <Col md={19} sm={24}>
              <Field
                name="applicant.address.address_line_1"
                label="Street"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={5} sm={24}>
              <Field name="applicant.address.suite_no" label="Unit #" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address.address_type_code"
                label="Country"
                required
                validate={[required]}
                data={countryOptions}
                component={RenderSelect}
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="applicant.address.sub_division_code"
                label="Province"
                required={!isInternational}
                data={provinceOptions.filter((p) => p.subType === address_type_code)}
                validate={!isInternational ? [required] : []}
                component={RenderSelect}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address.city"
                label="City"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address.post_code"
                label="Postal Code"
                component={RenderField}
                validate={[postalCodeWithCountry(address_type_code), maxLength(10)]}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Applicant;
