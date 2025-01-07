import React, { useEffect, useState } from "react";
import {
  createParty,
  updateParty,
  fetchParties,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getParties } from "@mds/common/redux/selectors/partiesSelectors";
import { compose, bindActionCreators } from "redux";
import { Field, isDirty, getFormValues, change } from "redux-form";
import { connect } from "react-redux";
import { Col, Row, Typography, Popconfirm, Button, Divider } from "antd";
import { debounce } from "lodash";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";

import { required, email, phoneNumber, maxLength } from "@mds/common/redux/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import PropTypes from "prop-types";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import { party as PartyPropType, partyRelationshipType } from "@/customPropTypes/parties";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  createParty: PropTypes.func.isRequired,
  updateParty: PropTypes.func.isRequired,
  fetchParties: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  handleSelectChange: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isDirty: PropTypes.bool.isRequired,
  formValues: PropTypes.objectOf(PartyPropType).isRequired,
  organizations: PropTypes.arrayOf(PartyPropType).isRequired,
  contacts: PropTypes.arrayOf(PartyPropType),
  partyRelationshipTypesList: PropTypes.arrayOf(partyRelationshipType).isRequired,
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
        const response = await props.updateParty(payload, values.party_guid);

        if (!response) return;

        const { data: party } = response;

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
    <FormWrapper
      initialValues={props.initialValues}
      name={FORM.ADD_CONTACT}
      onSubmit={onSubmit}
      reduxFormConfig={{
        destroyOnUnmount: true,
        forceUnregisterOnUnmount: true,
        enableReinitialize: true,
        touchOnBlur: true,
      }}
    >
      <Row gutter={16}>
        <Col span={24}>
          <Typography.Paragraph>
            Create a new contact for your organization. New contacts will be accessible accross all
            of your organizations mines during submission.
          </Typography.Paragraph>
        </Col>
        <Col span={12}>
          <Field
            label="Select Contact"
            id="party_guid"
            name="party_guid"
            placeholder="Select a contact"
            component={renderConfig.SELECT}
            onChange={props.handleSelectChange}
            data={props.contacts}
          />
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
          <Field
            label="First Name"
            id="first_name"
            name="first_name"
            placeholder="First Name"
            component={renderConfig.FIELD}
            required
            validate={[required, maxLength(200)]}
          />
        </Col>
        <Col span={12}>
          <Field
            label="Last Name"
            id="party_name"
            name="party_name"
            placeholder="Last Name"
            component={renderConfig.FIELD}
            required
            validate={[required, maxLength(200)]}
          />
        </Col>
        <Col span={12}>
          <Field
            label="Job Title"
            id="job_title_code"
            name="job_title_code"
            placeholder="Select a job title"
            onChange={handleSelectChange}
            component={renderConfig.SELECT}
            data={props.partyRelationshipTypesList}
          />
        </Col>
        <Col span={12}>
          <Field
            label="Company Affiliation"
            id="organization_guid"
            name="organization_guid"
            onChange={handleSelectChange}
            component={renderConfig.AUTOCOMPLETE}
            placeholder="Search organizations"
            data={transformOrganizations(props.organizations)}
            handleChange={searchOrganizations}
          />
        </Col>

        <Col span={12}>
          <Field
            label="Email"
            id="email"
            name="email"
            component={renderConfig.FIELD}
            placeholder="example@example.com"
            required
            validate={[email, required]}
          />
        </Col>
        <Col span={8}>
          <Field
            label="Phone Number"
            name="phone_no"
            id="phone_no"
            placeholder="XXX-XXX-XXXX"
            component={renderConfig.FIELD}
            required
            validate={[required, phoneNumber, maxLength(12)]}
            normalize={normalizePhone}
          />
        </Col>
        <Col span={4}>
          <Field
            label="Ext."
            name="phone_ext"
            id="phone_ext"
            component={renderConfig.FIELD}
            validate={[maxLength(6)]}
          />
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
    </FormWrapper>
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

export default compose(connect(mapStateToProps, mapDispatchToProps))(AddContactFormDetails);
