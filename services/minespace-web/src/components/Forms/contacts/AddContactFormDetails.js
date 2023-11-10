import React, { useEffect, useState } from "react";
import {
  createParty,
  updateParty,
  fetchParties,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getParties } from "@mds/common/redux/selectors/partiesSelectors";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, initialize, isDirty, reset, getFormValues, change } from "redux-form";
import { connect } from "react-redux";
import { Col, Row, Typography, Popconfirm, Button, Divider } from "antd";
import { Form } from "@ant-design/compatible";
import { debounce } from "lodash";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";

import {
  required,
  email,
  phoneNumber,
  validateSelectOptions,
  maxLength,
} from "@common/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { party as PartyPropType, partyRelationshipType } from "@/customPropTypes/parties";

const propTypes = {
  createParty: PropTypes.func.isRequired,
  updateParty: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PartyPropType).isRequired,
  organizations: PropTypes.arrayOf(PartyPropType).isRequired,
  contacts: PropTypes.arrayOf(PartyPropType),
  partyRelationshipTypesList: PropTypes.arrayOf(partyRelationshipType).isRequired,

  // eslint-disable-next-line react/no-unused-prop-types
  initialValues: PropTypes.objectOf(PartyPropType).isRequired,
};

const defaultProps = {
  contacts: [],
};

export const AddContactFormDetails = (props) => {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (values) => {
    const party_type_code = "PER";
    const payload = { party_type_code, ...values };

    setSubmitting(true);

    try {
      if (!values.party_guid) {
        // Party doesn't already exist, create it
        const { data: party } = await props.createParty(payload);

        await props.onSubmit(party);
      } else if (props.isDirty) {
        // Selected party has been updated, update it
        const { data: party } = await props.updateParty(payload, values.party_guid);

        await props.onSubmit(party);
      } else {
        // Selected party has not been updated, use it as is
        await props.onSubmit(values);
      }
    } finally {
      setSubmitting(true);
    }
  };

  const getSubmitText = () => {
    if (!props.formValues?.party_guid) {
      return "Create Contact";
    }

    if (props.isDirty) {
      return "Update and Select";
    }

    return "Select Contact";
  };

  const searchOrganizations = (search) => {
    props.fetchParties({
      type: "ORG",
      party_name: search,
      per_page: 10,
    });
  };

  useEffect(() => {
    searchOrganizations("");
  }, []);

  const transformOrganizations = (orgs) =>
    Object.values(orgs).map((org) => ({
      label: org.name,
      value: org.party_guid,
    }));

  const handleSelectChange = (e, val, oldVal, field) => {
    // Sets the value of the given select field to `val`
    // defaults a missing value to `null` instead of `undefined`
    // which allows the select component to clear the existing value instead of
    // defaulting to the initial value when "clear" is clicked
    props.change(FORM.ADD_CONTACT, field, val || null);
  };

  return (
    <Form layout="vertical" onSubmit={props.handleSubmit(onSubmit)}>
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Paragraph>
            Create a new contact for your organization. New contacts will be accessible accross all
            of your organizations mines during submission.
          </Typography.Paragraph>
        </Col>
        <Col span={12}>
          <Form.Item label="Select Contact">
            <Field
              id="party_guid"
              name="party_guid"
              placeholder="Select a contact"
              component={renderConfig.SELECT}
              onChange={props.handleSelectChange}
              data={props.contacts}
              validate={[validateSelectOptions(props.contacts, true)]}
            />
          </Form.Item>
        </Col>
        <Col span={24}>
          <Divider plain style={{ marginTop: 0 }} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Title level={5}>Contact Details</Typography.Title>

          <Typography.Paragraph>
            {props.formValues?.party_guid
              ? "If this contact requires edit before selection you can do so below."
              : "Please enter all contact information for this contact."}
          </Typography.Paragraph>
        </Col>
        <Col span={12}>
          <Form.Item label="First Name">
            <Field
              id="first_name"
              name="first_name"
              placeholder="First Name"
              component={renderConfig.FIELD}
              validate={[required, maxLength(200)]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Last Name">
            <Field
              id="party_name"
              name="party_name"
              placeholder="Last Name"
              component={renderConfig.FIELD}
              validate={[required, maxLength(200)]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Job Title (optional)">
            <Field
              id="job_title_code"
              name="job_title_code"
              placeholder="Select a job title"
              onChange={handleSelectChange}
              component={renderConfig.SELECT}
              data={props.partyRelationshipTypesList}
              validate={[validateSelectOptions(props.partyRelationshipTypesList)]}
            />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item label="Company Affiliation (optional)">
            <Field
              id="organization_guid"
              name="organization_guid"
              onChange={handleSelectChange}
              component={renderConfig.AUTOCOMPLETE}
              placeholder="Search organizations"
              data={transformOrganizations(props.organizations)}
              handleChange={searchOrganizations}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Email">
            <Field
              id="email"
              name="email"
              component={renderConfig.FIELD}
              placeholder="example@example.com"
              validate={[email, required]}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="Phone Number">
            <Field
              name="phone_no"
              id="phone_no"
              placeholder="XXX-XXX-XXXX"
              component={renderConfig.FIELD}
              validate={[required, phoneNumber, maxLength(12)]}
              normalize={normalizePhone}
            />
          </Form.Item>
        </Col>
        <Col span={4}>
          <Form.Item label="Ext. (optional)">
            <Field
              name="phone_ext"
              id="phone_ext"
              component={renderConfig.FIELD}
              validate={[maxLength(6)]}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row justify="space-between">
        <Popconfirm
          placement="top"
          title="Are you sure you want to cancel?"
          okText="Yes"
          cancelText="No"
          onConfirm={props.onCancel}
        >
          <Button disabled={submitting} className="full-mobile">
            Cancel
          </Button>
        </Popconfirm>
        <Button disabled={submitting} type="primary" className="full-mobile" htmlType="submit">
          {getSubmitText()}
        </Button>
      </Row>
    </Form>
  );
};

AddContactFormDetails.propTypes = propTypes;
AddContactFormDetails.defaultProps = defaultProps;

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      createParty,
      updateParty,
      fetchParties: (...args) => debounce(() => dispatch(fetchParties(...args)), 1000),
      initialize: (data) => initialize(FORM.ADD_CONTACT, data),
      reset,
      change,
    },
    dispatch
  );

const mapStateToProps = (state) => ({
  isDirty: isDirty(FORM.ADD_CONTACT)(state),
  formValues: getFormValues(FORM.ADD_CONTACT)(state),
  partyRelationshipTypesList: getPartyRelationshipTypesList(state),
  organizations: getParties(state),
});

export default compose(
  reduxForm({
    form: FORM.ADD_CONTACT,
    destroyOnUnmount: true,
    forceUnregisterOnUnmount: true,
    enableReinitialize: true,
    touchOnBlur: true,
  }),
  connect(mapStateToProps, mapDispatchToProps)
)(AddContactFormDetails);
