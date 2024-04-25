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
import { CONTACTS_COUNTRY_OPTIONS, FORM, IOrgbookCredential } from "@mds/common";
import RenderOrgBookSearch from "@mds/common/components/forms/RenderOrgBookSearch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleX, faSpinner } from "@fortawesome/pro-light-svg-icons";
import { verifyOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";
import RenderField from "@mds/common/components/forms/RenderField";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderCheckbox from "@mds/common/components/forms/RenderCheckbox";
import { normalizePhone } from "@common/utils/helpers";
import { fetchOrgBookCredential } from "@mds/common/redux/actionCreators/orgbookActionCreator";
import { getOrgBookCredential } from "@mds/common/redux/selectors/orgbookSelectors";

const { Title, Paragraph } = Typography;
interface IVerifiedCredential {
  businessNumber: string;
  registrationStatus: string;
  registriesId: number;
}

const Applicant = () => {
  const dispatch = useDispatch();
  const provinceOptions = useSelector(getDropdownProvinceOptions);
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const [verified, setVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [orgBookOptions, setOrgBookOptions] = useState([]);
  const [verifiedCredential, setVerifiedCredential] = useState<IVerifiedCredential>(null);

  const orgBookCredential = useSelector(getOrgBookCredential);
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const {
    applicant = {},
    is_legal_address_same_as_mailing_address = false,
    is_billing_address_same_as_mailing_address = false,
    is_billing_address_same_as_legal_address = false,
  } = formValues;
  const { party_type_code, address = [], credential_id } = applicant ?? {};

  const [mailingAddress, legalAddress, billingAddress] = address || [];
  const isMailingInternational = mailingAddress?.address_type_code === "INT";
  const isLegalInternational = legalAddress?.address_type_code === "INT";
  const isBusinessInternational = billingAddress?.address_type_code === "INT";

  const applicantAddress = {
    mailingAddress: 0,
    legalAddress: 1,
    billingAddress: 2,
  };

  useEffect(() => {
    if (credential_id) dispatch(fetchOrgBookCredential(credential_id));
  }, [credential_id]);

  useEffect(() => {
    const defaultPartyTypeCode = party_type_code || "ORG";
    dispatch(
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.party_type_code", defaultPartyTypeCode)
    );
  }, []);

  useEffect(() => {
    if (orgBookCredential?.topic) {
      setCredential(orgBookCredential);
      const options = [{ text: orgBookCredential.topic.local_name.text, value: credential_id }];
      setOrgBookOptions(options);
    }
  }, [orgBookCredential]);

  useEffect(() => {
    setVerified(false);
    setCheckingStatus(true);
    if (credential) {
      dispatch(verifyOrgBookCredential(credential.id)).then((response) => {
        setVerified(response.success);
        setCheckingStatus(false);
        const payload = {
          businessNumber: credential.topic.source_id || "-",
          registrationStatus: credential.inactive ? "Inactive" : "Active",
          registriesId: credential.id,
        };
        setVerifiedCredential(payload);
      });
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.credential_id", credential.id));
      const orgBookEntity = {
        registration_id: credential.topic.source_id,
        registration_status: !credential.inactive,
        registration_date: credential.attributes[0].value,
        name_id: credential.topic.local_name.id,
        name_text: credential.topic.local_name.text,
        credential_id: credential.topic.local_name.credential_id,
        company_alias: null,
      };
      dispatch(
        change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.party_orgbook_entity", orgBookEntity)
      );
    }
  }, [credential]);

  useEffect(() => {
    setCredential(null);
  }, [party_type_code]);

  const renderStatus = () => {
    let icon = faSpinner;
    let color = undefined;
    let text = undefined;

    if ((!checkingStatus && verified) || verifiedCredential) {
      icon = faCircleCheck;
      color = "#45A766";
      text = "Verified on Orgbook BC";
    } else {
      icon = faCircleX;
      color = "#D8292F";
      text = "Not registered on Orgbook BC";
    }

    return (
      <Paragraph strong className="light">
        <FontAwesomeIcon
          size="lg"
          color={color}
          icon={icon}
          spin={checkingStatus && !verifiedCredential}
          className="margin-medium--right"
        />
        {text}
      </Paragraph>
    );
  };

  const updateAddressSubDivisionCode = (index: number) => {
    const selectedProvince = address?.[index]?.sub_division_code
      ? provinceOptions.find((p) => p.value === address?.[index]?.sub_division_code)
      : {};
    if (
      address?.[index]?.address_type_code === "INT" ||
      selectedProvince?.subType !== address?.[index]?.address_type_code
    ) {
      dispatch(
        change(FORM.ADD_EDIT_PROJECT_SUMMARY, `applicant.address[${index}].sub_division_code`, null)
      );
    }
  };

  useEffect(() => {
    updateAddressSubDivisionCode(0);
  }, [address?.[0]?.address_type_code]);

  useEffect(() => {
    updateAddressSubDivisionCode(1);
  }, [address?.[1]?.address_type_code]);

  useEffect(() => {
    updateAddressSubDivisionCode(2);
  }, [address?.[2]?.address_type_code]);

  const handleResetParty = () => {
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.party_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.party_orgbook_entity", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.first_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "applicant.middle_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "company_alias", null));
    setCredential(null);
    setVerifiedCredential(null);
    setOrgBookOptions(null);
  };

  const handleUpdateAddress = (
    event: any,
    sourceAddressIndex: number,
    destinationAddressIndex: number
  ) => {
    if (event) {
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].address_line_1`,
          address[sourceAddressIndex].address_line_1
        )
      );
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].address_type_code`,
          address[sourceAddressIndex].address_type_code
        )
      );
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].city`,
          address[sourceAddressIndex].city
        )
      );
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].post_code`,
          address[sourceAddressIndex].post_code
        )
      );
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].sub_division_code`,
          address[sourceAddressIndex].sub_division_code
        )
      );
      dispatch(
        change(
          FORM.ADD_EDIT_PROJECT_SUMMARY,
          `applicant.address[${destinationAddressIndex}].suite_no`,
          address[sourceAddressIndex].suite_no
        )
      );
    }
  };

  const areAllAddressFieldsValid = (isAddressInternational: boolean, index: number) => {
    if (!address?.[index]) {
      return false;
    }

    const { address_line_1, address_type_code, city, post_code, sub_division_code } = address[
      index
    ];

    if (!isAddressInternational) {
      return address_line_1 && address_type_code && city && post_code && sub_division_code;
    } else {
      return address_line_1 && address_type_code && city && post_code;
    }
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
            value: "PER",
          },
        ]}
        optionType="button"
        onChange={handleResetParty}
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
            data={orgBookOptions}
            help={"as registered with the BC Registrar of Companies"}
            component={RenderOrgBookSearch}
          />
          {verifiedCredential && (
            <div className="table-summary-card">
              {renderStatus()}

              <Paragraph className="light margin-none">
                Business Number: {verifiedCredential.businessNumber}
              </Paragraph>

              <Paragraph className="light margin-none">
                BC Registries ID: {verifiedCredential.registriesId}
              </Paragraph>
              <Paragraph className="light margin-none">
                BC Registration Status {verifiedCredential.registrationStatus}
              </Paragraph>
            </div>
          )}
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
                id="applicant.party_orgbook_entity.registration_id"
                name="applicant.party_orgbook_entity.registration_id"
                label="Incorporation Number"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
          </Row>
        </div>
      )}
      {party_type_code === "PER" && (
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
            <Field name="applicant.middle_name" label="Middle Name" component={RenderField} />
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
      <Typography.Title level={5}>Mailing Address</Typography.Title>
      <Row gutter={16}>
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
      </Row>
      <Row gutter={16}>
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
            required={!isMailingInternational}
            validate={!isMailingInternational ? [required] : []}
            data={provinceOptions.filter(
              (p) =>
                p.subType ===
                applicant?.address?.[applicantAddress.mailingAddress]?.address_type_code
            )}
            component={RenderSelect}
          />
        </Col>
      </Row>

      <Row gutter={16}>
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
            required
            validate={[
              postalCodeWithCountry(
                applicant?.address?.[applicantAddress.mailingAddress]?.address_type_code
              ),
              maxLength(10),
            ]}
          />
        </Col>
      </Row>
      <Typography.Title level={5}>Legal Address</Typography.Title>
      <Field
        id="is_legal_address_same_as_mailing_address"
        name="is_legal_address_same_as_mailing_address"
        component={RenderCheckbox}
        props={{
          label: "Same as mailing address",
        }}
        type="checkbox"
        disabled={
          !areAllAddressFieldsValid(isMailingInternational, applicantAddress.mailingAddress)
        }
        onChange={(e) =>
          handleUpdateAddress(e, applicantAddress.mailingAddress, applicantAddress.legalAddress)
        }
      />
      {!is_legal_address_same_as_mailing_address && (
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
                required={!isLegalInternational}
                validate={!isLegalInternational ? [required] : []}
                data={provinceOptions.filter(
                  (p) =>
                    p.subType ===
                    applicant?.address?.[applicantAddress.legalAddress]?.address_type_code
                )}
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
                required
                validate={[
                  postalCodeWithCountry(
                    applicant?.address?.[applicantAddress.legalAddress]?.address_type_code
                  ),
                  maxLength(10),
                ]}
              />
            </Col>
          </Row>
        </>
      )}
      <Typography.Title level={5}>Billing Address</Typography.Title>
      <Row gutter={16}>
        <Col md={8} sm={24}>
          <Field
            id="is_billing_address_same_as_mailing_address"
            name="is_billing_address_same_as_mailing_address"
            props={{
              label: "Same as mailing address",
            }}
            disabled={
              !areAllAddressFieldsValid(isMailingInternational, applicantAddress.mailingAddress) ||
              is_billing_address_same_as_legal_address
            }
            component={RenderCheckbox}
            type="checkbox"
            onChange={(e) =>
              handleUpdateAddress(
                e,
                applicantAddress.mailingAddress,
                applicantAddress.billingAddress
              )
            }
          />
        </Col>
        <Col md={8} sm={24}>
          <Field
            id="is_billing_address_same_as_legal_address"
            name="is_billing_address_same_as_legal_address"
            props={{
              label: "Same as legal address",
            }}
            disabled={
              is_billing_address_same_as_mailing_address ||
              (!areAllAddressFieldsValid(isLegalInternational, applicantAddress.legalAddress) &&
                !is_legal_address_same_as_mailing_address)
            }
            component={RenderCheckbox}
            type="checkbox"
            onChange={(e) =>
              handleUpdateAddress(e, applicantAddress.legalAddress, applicantAddress.billingAddress)
            }
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
                required={!isBusinessInternational}
                validate={!isBusinessInternational ? [required] : []}
                data={provinceOptions.filter(
                  (p) =>
                    p.subType ===
                    applicant?.address?.[applicantAddress.billingAddress]?.address_type_code
                )}
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
                required
                validate={[
                  postalCodeWithCountry(
                    applicant?.address?.[applicantAddress.billingAddress]?.address_type_code
                  ),
                  maxLength(10),
                ]}
              />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Applicant;
