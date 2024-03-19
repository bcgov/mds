import { Col, Row, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Field, getFormValues, change, FieldArray } from "redux-form";
import {
  email,
  maxLength,
  phoneNumber,
  postalCodeWithCountry,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { CONTACTS_COUNTRY_OPTIONS, FORM, IOrgbookCredential } from "@mds/common";
import OrgBookSearch from "@mds/common/components/parties/OrgBookSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleX, faSpinner } from "@fortawesome/pro-light-svg-icons";
import { isEmpty } from "lodash";
import { verifyOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";
import RenderField from "@mds/common/components/forms/RenderField";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import { normalizePhone } from "@common/utils/helpers";

const { Title, Paragraph } = Typography;

const RenderAddress = (props) => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const {
    is_legal_address_same_as_mailing_address = false,
    is_billing_address_same_as_mailing_address = false,
    is_billing_address_same_as_legal_address = false,
  } = formValues;

  const { fields, applicant } = props;
  const addressType = ["Mailing Address", "Legal Address", "Billing Address"];

  const dispatch = useDispatch();
  const provinceOptions = useSelector(getDropdownProvinceOptions);
  const handleClearProvince = (currentCountry, addressTypeCode, subDivisionCode, field) => {
    // clear out the province if country has changed and it no longer matches
    if (addressTypeCode !== currentCountry) {
      const selectedProvince = currentCountry
        ? provinceOptions.find((p) => p.value === subDivisionCode)
        : {};

      const contactFieldToBeChanged = `${field}.sub_division_code`;
      if (addressTypeCode === "INT" || selectedProvince?.subType !== currentCountry) {
        dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, contactFieldToBeChanged, null));
      }
    }
  };

  const renderAddressFields = (field, address_type_code, sub_division_code, isInternational) => (
    <>
      <Row gutter={16}>
        <Col md={19} sm={24}>
          <Field
            name={`${field}.address_line_1`}
            label="Street"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={5} sm={24}>
          <Field name={`${field}.suite_no`} label="Unit #" component={RenderField} />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name={`${field}.address_type_code`}
            label="Country"
            required
            validate={[required]}
            data={CONTACTS_COUNTRY_OPTIONS}
            component={RenderSelect}
            onSelect={(e) => handleClearProvince(e, address_type_code, sub_division_code, field)}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name={`${field}.sub_division_code`}
            label="Province"
            required
            data={provinceOptions.filter((p) => p.subType === address_type_code)}
            validate={!isInternational ? [required] : []}
            component={RenderSelect}
          />
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name={`${field}.city`}
            label="City"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name={`${field}.post_code`}
            label="Postal Code"
            component={RenderField}
            required
            validate={[postalCodeWithCountry(address_type_code), maxLength(10)]}
          />
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {fields.map((field, index) => {
        const { address } = applicant?.address[index] ?? {};
        const { address_type_code, sub_division_code } = address ?? {};
        const isInternational = address_type_code === "INT";

        return (
          <div key={index}>
            <Typography.Title level={5}>{addressType[index]}</Typography.Title>
            {index === 1 && (
              <Field
                id="is_legal_address_same_as_mailing_address"
                name="is_legal_address_same_as_mailing_address"
                component={RenderCheckbox}
                label="Same as mailing address"
                type="checkbox"
              />
            )}
            {index === 2 && (
              <Row gutter={16}>
                <Col md={8} sm={24}>
                  <Field
                    id="is_billing_address_same_as_mailing_address"
                    name="is_billing_address_same_as_mailing_address"
                    label="Same as mailing address"
                    disabled={is_billing_address_same_as_legal_address}
                    component={RenderCheckbox}
                    type="checkbox"
                  />
                </Col>
                <Col md={8} sm={24}>
                  <Field
                    id="is_billing_address_same_as_legal_address"
                    name="is_billing_address_same_as_legal_address"
                    label="Same as legal address"
                    disabled={is_billing_address_same_as_mailing_address}
                    component={RenderCheckbox}
                    type="checkbox"
                  />
                </Col>
              </Row>
            )}
            {(index === 0 ||
              (index === 1 && !is_legal_address_same_as_mailing_address) ||
              (index === 2 &&
                !is_billing_address_same_as_mailing_address &&
                !is_billing_address_same_as_legal_address)) &&
              renderAddressFields(field, address_type_code, sub_division_code, isInternational)}
          </div>
        );
      })}
    </>
  );
};

const Applicant = () => {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [verified, setVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { applicant = {} } = formValues;
  const { party_type_code } = applicant ?? {};

  useEffect(() => {
    if (!applicant?.address) {
      dispatch(
        change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.address", [
          {
            address_line_1: "",
            suite_no: "",
            address_type_code: "",
            sub_division_code: "",
            city: "",
            post_code: "",
          },
          {
            address_line_1: "",
            suite_no: "",
            address_type_code: "",
            sub_division_code: "",
            city: "",
            post_code: "",
          },
          {
            address_line_1: "",
            suite_no: "",
            address_type_code: "",
            sub_division_code: "",
            city: "",
            post_code: "",
          },
        ])
      );
    }
  }, []);

  useEffect(() => {
    setVerified(false);
    setCheckingStatus(true);
    if (credential) {
      dispatch(verifyOrgBookCredential(credential.id)).then((response) => {
        setVerified(response.success);
        setCheckingStatus(false);
      });
      const incorporationNumber = credential.topic.source_id ? credential.topic.source_id : null;
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "incorporation_number", incorporationNumber));
    }
  }, [credential]);

  useEffect(() => {
    setCredential(null);
  }, [party_type_code]);

  useEffect(() => {
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.party_type_code", "ORG"));
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
        name="applicant.party_type_code"
        id="applicant.party_type_code"
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
      {party_type_code === "ORG" && (
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
                    id="company_alias"
                    name="company_alias"
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
      {party_type_code === "IND" && (
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
              name="applicant.party_name"
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
            component={RenderField}
            validate={[phoneNumber, maxLength(12), required]}
            normalize={normalizePhone}
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
      <FieldArray name="applicant.address" component={RenderAddress} />
      {/* <Row gutter={16}>
        <Col md={19} sm={24}>
          <Field
            name="applicant.address[0].address_line_1"
            label="Street"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={5} sm={24}>
          <Field name="applicant.address[0].suite_no" label="Unit #" component={RenderField} />
        </Col>
      </Row> */}

      {/* <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address[0].address_type_code"
            label="Country"
            required
            validate={[required]}
            data={CONTACTS_COUNTRY_OPTIONS}
            component={RenderSelect}
          />
        </Col>

        <Col md={12} sm={24}>
          <Field
            name="applicant.address[0].sub_division_code"
            label="Province"
            required={!isMailingAddressInternational}
            data={provinceOptions.filter(
              (p) => p.subType === applicant.address[0].address_type_code
            )}
            validate={!isMailingAddressInternational ? [required] : []}
            component={RenderSelect}
          />
        </Col>
      </Row> */}

      {/* <Row gutter={16}>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address[0].city"
            label="City"
            required
            validate={[required]}
            component={RenderField}
          />
        </Col>
        <Col md={12} sm={24}>
          <Field
            name="applicant.address[0].post_code"
            label="Postal Code"
            component={RenderField}
            validate={[
              postalCodeWithCountry(applicant.address[0].address_type_code),
              maxLength(10),
            ]}
          />
        </Col>
      </Row> */}
      {/* <Typography.Title level={4}>Legal Address</Typography.Title>
      <Field
        id="is_legal_address_same_as_mailing_address"
        name="is_legal_address_same_as_mailing_address"
        component={RenderCheckbox}
        label="Same as mailing address"
        type="checkbox"
      /> */}
      {/* {/* {!is_legal_address_same_as_mailing_address && (
        <>
          <Row gutter={16}>
            <Col md={19} sm={24}>
              <Field
                name="applicant.address[1].address_line_1"
                label="Street"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={5} sm={24}>
              <Field name="applicant.address[1].suite_no" label="Unit #" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[1].address_type_code"
                label="Country"
                required
                validate={[required]}
                data={CONTACTS_COUNTRY_OPTIONS}
                component={RenderSelect}
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="applicant.address[1].sub_division_code"
                label="Province"
                required={!isLegalAddressInternational}
                data={provinceOptions.filter(
                  (p) => p.subType === applicant.address[1].address_type_code
                )}
                validate={!isLegalAddressInternational ? [required] : []}
                component={RenderSelect}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[1].city"
                label="City"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[1].post_code"
                label="Postal Code"
                component={RenderField}
                validate={[
                  postalCodeWithCountry(applicant.address[1].address_type_code),
                  maxLength(10),
                ]}
              />
            </Col>
          </Row>
        </>
      )} */}
      {/* <Typography.Title level={4}>Billing Address</Typography.Title> */}
      {/* <Row gutter={16}>
        <Col md={8} sm={24}>
          <Field
            id="is_billing_address_same_as_mailing_address"
            name="is_billing_address_same_as_mailing_address"
            label="Same as mailing address"
            component={RenderCheckbox}
            type="checkbox"
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            id="is_billing_address_same_as_legal_address"
            name="is_billing_address_same_as_legal_address"
            label="Same as legal address"
            component={RenderCheckbox}
            type="checkbox"
          />
        </Col>
      </Row>
      {!is_billing_address_same_as_mailing_address && !is_billing_address_same_as_legal_address && (
        <>
          <Row gutter={16}>
            <Col md={19} sm={24}>
              <Field
                name="applicant.address[2].address_line_1"
                label="Street"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={5} sm={24}>
              <Field name="applicant.address[2].suite_no" label="Unit #" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[2].address_type_code"
                label="Country"
                required
                validate={[required]}
                data={CONTACTS_COUNTRY_OPTIONS}
                component={RenderSelect}
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="applicant.address[2].sub_division_code"
                label="Province"
                required={!isBillingAddressInternational}
                data={provinceOptions.filter(
                  (p) => p.subType === applicant.address[2].address_type_code
                )}
                validate={!isBillingAddressInternational ? [required] : []}
                component={RenderSelect}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[2].city"
                label="City"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="applicant.address[2].post_code"
                label="Postal Code"
                component={RenderField}
                validate={[
                  postalCodeWithCountry(applicant.address[2].address_type_code),
                  maxLength(10),
                ]}
              />
            </Col>
          </Row>
        </>
      )} */}
    </div>
  );
};

export default Applicant;
