import React, { FC } from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Col, Form, Row, Typography } from "antd";

import { FORM, IProjectSummary } from "@mds/common";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderRadioButtons from "@mds/common/components/forms/RenderRadioButtons";
import { required } from "@mds/common/redux/utils/Validate";

interface AgentProps {
  initialValues: Partial<IProjectSummary>;
}

export const Agent: FC<AgentProps> = ({ initialValues }) => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const { is_agent, agent_company_legal_name, first_name, last_name } = formValues;
  console.log(
    "agent_company_legal_name",
    agent_company_legal_name,
    "first_name",
    first_name,
    "last_name",
    last_name
  );
  const isContactNameValid = Boolean(agent_company_legal_name || (first_name && last_name));
  console.log(isContactNameValid, formValues);

  console.log(initialValues);
  // TODO: Maybe that className should be at a higher level- make sure it doesn't break the other pages though
  return (
    <div className="ant-form-vertical">
      <Typography.Title level={3}>Agent</Typography.Title>
      <Typography.Paragraph>
        The Applicant may authorize an Agent to deal with the Ministry directly on future aspects of
        this application. This section must be completed in full if an Agent is used. An Agent is a
        person who is not an employee of the Applicant.
      </Typography.Paragraph>

      <Field
        name="is_agent"
        id="is_agent"
        required
        validate={[required]}
        label="Are you an agent applying on behalf of the applicant?"
        component={RenderRadioButtons}
      />

      {is_agent && (
        <>
          <Form.Item
            style={
              isContactNameValid
                ? { border: "1px solid blue", padding: "16px", borderRadius: "5px" }
                : { border: "1px solid red", padding: "16px", borderRadius: "5px" }
            }
            label="Contact Name (Choose one)"
            required
            validateStatus={isContactNameValid ? "" : "error"}
            help={
              isContactNameValid ? (
                ""
              ) : (
                <span>Please enter the Agent&apos;s Company Legal Name or First & Last Names</span>
              )
            }
          >
            <div className="hide-optional-text">
              <Field
                name="agent_company_legal_name"
                label="Agent's Company Legal Name"
                component={RenderField}
                help="as registered with the BC Registar of Companies"
              />
            </div>
            <Row gutter={16}>
              <Col md={12} sm={24} className="hide-optional-text">
                <Field name="first_name" label="First Name" component={RenderField} />
              </Col>
              <Col md={12} sm={24} className="hide-optional-text">
                <Field name="last_name" label="Last Name" component={RenderField} />
              </Col>
            </Row>
          </Form.Item>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="doing_business_as"
                label="Doing Business As"
                component={RenderField}
                help="if different than the Company Legal Name"
              />
            </Col>
            <Col md={12} sm={24}>
              <Field name="agent_title" label="Agent's Title" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={9.5} sm={19}>
              <Field
                name="contact_number"
                label="Contact Number"
                required
                validation={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={2.5} sm={5}>
              <Field name="extension" label="Ext." component={RenderField} />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="email_address"
                label="Email Address"
                required
                validation={[required]}
                component={RenderField}
              />
            </Col>
          </Row>

          <Typography.Title level={4}>Mailing Address</Typography.Title>
          <Row gutter={16}>
            <Col md={19} sm={24}>
              <Field
                name="street"
                label="Street"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={5} sm={24}>
              <Field name="unit" label="Unit #" component={RenderField} />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="city"
                label="City"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field
                name="province"
                label="Province"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
          </Row>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Field
                name="country"
                label="Country"
                required
                validate={[required]}
                component={RenderField}
              />
            </Col>
            <Col md={12} sm={24}>
              <Field name="postal" label="Postal Code" component={RenderField} />
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};
