import React, { FC, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Field, change, getFormValues } from "redux-form";
import { Col, Form, Row, Typography } from "antd";
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

export const Agent: FC = () => {
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { agent = {}, is_agent = false } = formValues;
  const { party_type_code, address = {} } = agent ?? {};
  const { address_type_code } = address ?? {};
  const isInternational = address_type_code === "INT";

  const provinceOptions = useSelector(getDropdownProvinceOptions);
  // currently no endpoints, etc, for address_type_code
  const countryOptions = [
    { value: "CAN", label: "Canada" },
    { value: "USA", label: "United States" },
    { value: "INT", label: "International" },
  ];

  // set a value for party type code because required validation doesn't show
  if (!party_type_code) {
    dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.party_type_code", "ORG"));
  }

  useEffect(() => {
    if (party_type_code === "ORG") {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.first_name", null));
    }
  }, [party_type_code]);

  useEffect(() => {
    if (address_type_code === "INT") {
      dispatch(change(FORM.ADD_EDIT_PROJECT_SUMMARY, "agent.address.sub_division_code", null));
    }
  }, [address_type_code]);

  return (
    <Form name={FORM.ADD_EDIT_PROJECT_SUMMARY} layout="vertical">
      <div className="ant-form-vertical">
        <Typography.Title level={3}>Agent</Typography.Title>
        <Typography.Paragraph>
          The Applicant may authorize an Agent to deal with the Ministry directly on future aspects
          of this application. This section must be completed in full if an Agent is used. An Agent
          is a person who is not an employee of the Applicant.
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
            />
            {party_type_code === "ORG" && (
              // TODO: With orgbook integration, this should populate something in orgbook, not agent.party_name
              <Field
                name="agent.party_name"
                label="Agent's Company Legal Name"
                required
                validate={[required, maxLength(100)]}
                component={RenderField}
                help="as registered with the BC Registar of Companies"
              />
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

            <Typography.Title level={4}>Mailing Address</Typography.Title>
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
                  data={countryOptions}
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
                  validate={isInternational ? [] : [postalCodeWithCountry(address_type_code)]}
                />
              </Col>
            </Row>
          </>
        )}
      </div>
    </Form>
  );
};
