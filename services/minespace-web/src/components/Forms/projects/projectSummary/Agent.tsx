import React, { FC, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, change, getFormValues } from "redux-form";
import { Col, Row, Typography, Alert } from "antd";
import { FORM } from "@mds/common";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import {
  email,
  maxLength,
  phoneNumber,
  postalCodeWithCountry,
  required,
  requiredRadioButton,
} from "@mds/common/redux/utils/Validate";
import { getDropdownProvinceOptions } from "@mds/common/redux/selectors/staticContentSelectors";
import { CONTACTS_COUNTRY_OPTIONS, IOrgbookCredential } from "@mds/common";
import RenderOrgBookSearch from "@mds/common/components/forms/RenderOrgBookSearch";
import {
  fetchOrgBookCredential,
  verifyOrgBookCredential,
} from "@mds/common/redux/actionCreators/orgbookActionCreator";
import { getOrgBookCredential } from "@mds/common/redux/selectors/orgbookSelectors";
import { normalizePhone } from "@common/utils/helpers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck, faCircleX, faSpinner } from "@fortawesome/pro-light-svg-icons";

export const Agent: FC = () => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { agent = {}, is_agent = false } = formValues;
  const { party_type_code, address = {}, credential_id } = agent ?? {};
  const { address_type_code, sub_division_code } = address ?? {};
  const isInternational = address_type_code === "INT";
  // currently no endpoints, etc, for address_type_code
  const provinceOptions = useSelector(getDropdownProvinceOptions);
  const [orgBookOptions, setOrgBookOptions] = useState([]);
  const [credential, setCredential] = useState<IOrgbookCredential>(null);
  const orgBookCredential = useSelector(getOrgBookCredential);
  const [verified, setVerified] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [verifiedCredential, setVerifiedCredential] = useState(null);

  useEffect(() => {
    setCheckingStatus(true);
    setOrgBookOptions([]);
    setCredential(null);
    setVerified(false);
    setVerifiedCredential(null);
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_orgbook_entity", null));
    if (credential_id) dispatch(fetchOrgBookCredential(credential_id));
  }, [credential_id]);

  useEffect(() => {
    if (credential_id && orgBookCredential?.topic) {
      setCredential(orgBookCredential);
      const options = [{ text: orgBookCredential.topic.local_name.text, value: credential_id }];
      setOrgBookOptions(options);
    }
  }, [orgBookCredential]);

  useEffect(() => {
    // set a value for party type code because required validation doesn't show
    if (!party_type_code && is_agent) {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_type_code", "ORG"));
    } else if (!is_agent) {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent", {}));
    }
  }, [is_agent]);

  useEffect(() => {
    setCredential(null);
    if (party_type_code === "ORG") {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.first_name", null));
    }
  }, [party_type_code]);

  useEffect(() => {
    // clear out the province if country has changed and it no longer matchess
    const selectedProvince = sub_division_code
      ? provinceOptions.find((p) => p.value === sub_division_code)
      : {};
    if (address_type_code === "INT" || selectedProvince?.subType !== address_type_code) {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.address.sub_division_code", null));
    }
  }, [address_type_code]);

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
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.credential_id", credential.id));
      const orgBookEntity = {
        registration_id: credential.topic.source_id,
        registration_status: !credential.inactive,
        registration_date: credential.attributes[0].value,
        name_id: credential.topic.local_name.id,
        name_text: credential.topic.local_name.text,
        credential_id: credential.topic.local_name.credential_id,
        company_alias: null,
      };
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_orgbook_entity", orgBookEntity));
    }
  }, [credential]);

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
      <Typography.Paragraph strong className="light">
        <FontAwesomeIcon
          size="lg"
          color={color}
          icon={icon}
          spin={checkingStatus}
          className="margin-medium--right"
        />
        {text}
      </Typography.Paragraph>
    );
  };

  const handleResetParty = () => {
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.first_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.middle_name", null));
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_orgbook_entity", null));
    setCredential(null);
    setOrgBookOptions(null);
    setVerifiedCredential(null);
  };

  return (
    <div className="ant-form-vertical">
      <Typography.Title level={3}>Representing Agent</Typography.Title>
      <Typography.Paragraph>
        The applicant may authorize a representing agent to deal with the Ministry directly on
        future aspects of this application. This section must be completed in full if a representing
        agent is a person who is not an employee of the applicant.
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Alert
          description="This section will not identify the Agent as defined under the Mines Act, unless the Ministry of Energy, Mines and Low Carbon Innovation is otherwise notified by the owner."
          type="warning"
          showIcon
        />
      </Typography.Paragraph>
      <Field
        name="is_agent"
        id="is_agent"
        required
        validate={[requiredRadioButton]}
        label="Are you an agent applying on behalf of the applicant?"
        component={RenderRadioButtons}
      />

      {is_agent && (
        <>
          <Field
            name="agent.party_type_code"
            required
            component={RenderRadioButtons}
            defaultValue={"ORG"}
            customOptions={[
              { label: "Organization", value: "ORG" },
              { label: "Person", value: "PER" },
            ]}
            optionType="button"
            onChange={handleResetParty}
          />
          {party_type_code === "ORG" && (
            <div>
              <Field
                name="agent.party_name"
                id="agent.party_name"
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

                  <Typography.Paragraph className="light margin-none">
                    Business Number: {verifiedCredential.businessNumber}
                  </Typography.Paragraph>

                  <Typography.Paragraph className="light margin-none">
                    BC Registries ID: {verifiedCredential.registriesId}
                  </Typography.Paragraph>
                  <Typography.Paragraph className="light margin-none">
                    BC Registration Status {verifiedCredential.registrationStatus}
                  </Typography.Paragraph>
                </div>
              )}
              <Row gutter={16}>
                <Col md={12} sm={24}>
                  <Field
                    id="agent.party_orgbook_entity.registration_id"
                    name="agent.party_orgbook_entity.registration_id"
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
              <Col md={12} sm={24}>
                <Field
                  name="agent.first_name"
                  label="First Name"
                  component={RenderField}
                  required
                  validate={[required, maxLength(100)]}
                />
              </Col>
              <Col md={12} sm={24}>
                <Field
                  name="agent.party_name"
                  label="Last Name"
                  component={RenderField}
                  required
                  validate={[required, maxLength(100)]}
                />
              </Col>
            </Row>
          )}

          <Row gutter={16}>
            {/* TODO: With Orgbook integration, this should probably be the agent.party_name */}
            {/* <Col md={12} sm={24}>
                <Field
                  name="agent.doing_business_as"
                  label="Doing Business As"
                  component={RenderField}
                  help="if different than the Company Legal Name"
                />
              </Col> */}
            <Col md={12} sm={24}>
              <Field name="agent.job_title" label="Agent's Title" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={8} sm={19}>
              <Field
                name="agent.phone_no"
                label="Contact Number"
                required
                validate={isInternational ? [required] : [required, phoneNumber]}
                component={RenderField}
                normalize={normalizePhone}
              />
            </Col>
            <Col md={4} sm={5}>
              <Field name="agent.phone_ext" label="Ext." component={RenderField} />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="agent.email"
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
                name="agent.address.address_line_1"
                label="Street"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={5} sm={24}>
              <Field name="agent.address.suite_no" label="Unit #" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="agent.address.address_type_code"
                label="Country"
                required
                validate={[required]}
                data={CONTACTS_COUNTRY_OPTIONS}
                component={RenderSelect}
              />
            </Col>

            <Col md={12} sm={24}>
              <Field
                name="agent.address.sub_division_code"
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
                name="agent.address.city"
                label="City"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="agent.address.post_code"
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
