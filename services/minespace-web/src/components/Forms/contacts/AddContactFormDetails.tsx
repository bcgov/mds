import React, { FC, useEffect } from "react";
import {
  createParty,
  updateParty,
  fetchParties,
} from "@mds/common/redux/actionCreators/partiesActionCreator";
import { getParties } from "@mds/common/redux/selectors/partiesSelectors";
import { Field, isDirty, getFormValues, change } from "@mds/common/components/forms/form";
import { Col, Row, Typography, Divider } from "antd";
import { debounce } from "lodash";
import { getPartyRelationshipTypesList } from "@mds/common/redux/selectors/staticContentSelectors";

import { required, email, phoneNumber, maxLength } from "@mds/common/redux/utils/Validate";
import { normalizePhone } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";
import { IOption, IParty } from "@mds/common/interfaces";
import { useAppDispatch, useAppSelector } from "@mds/common/redux/rootState";
import RenderSelect from "@mds/common/components/forms/RenderSelect";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";

interface AddContactFormDetailsProps {
  contacts: IOption[];
  initialValues?: IParty;
  handleSelectChange: (party_guid: string) => void;
  onSubmit: (values: IParty) => void;
  isModal?: boolean;
}

export const AddContactFormDetails: FC<AddContactFormDetailsProps> = (props) => {
  const dispatch = useAppDispatch();
  const formName = FORM.ADD_CONTACT;
  const isFormDirty = useAppSelector(isDirty(formName));
  const formValues = useAppSelector(getFormValues(FORM.ADD_CONTACT)) as IParty;
  const partyRelationshipTypesList = useAppSelector(getPartyRelationshipTypesList);
  const organizations = useAppSelector(getParties) as IParty[];

  const handleFetchParties = (...args) => debounce(() => dispatch(fetchParties(...args)), 1000);

  const onSubmit = async (values) => {
    const party_type_code = "PER";
    const payload = { party_type_code, ...values };

    if (!values.party_guid) {
      // Party doesn't already exist, create it
      const { data: party } = await dispatch(createParty(payload));

      props.onSubmit(party);
    } else if (isFormDirty) {
      // Selected party has been updated, update it
      const response = await dispatch(updateParty(payload, values.party_guid));

      if (!response) return;

      const { data: party } = response;

      props.onSubmit(party);
    } else {
      // Selected party has not been updated, use it as is
      props.onSubmit(values);
    }
  };

  const getSubmitText = () => {
    if (!formValues?.party_guid) {
      return "Create Contact";
    }

    if (isFormDirty) {
      return "Update and Select";
    }

    return "Select Contact";
  };

  const searchOrganizations = (search) => {
    handleFetchParties({
      type: "ORG",
      party_name: search,
      per_page: 10,
    });
  };

  useEffect(() => {
    searchOrganizations("");
  }, []);

  const transformOrganizations = (orgs: IParty[]) =>
    Object.values(orgs).map((org) => ({
      label: org.name,
      value: org.party_guid,
    }));

  const handleSelectChange = (_e, val: string, _oldVal, field: string) => {
    // Sets the value of the given select field to `val`
    // defaults a missing value to `null` instead of `undefined`
    // which allows the select component to clear the existing value instead of
    // defaulting to the initial value when "clear" is clicked
    dispatch(change(formName, field, val || null));
  };

  return (
    <FormWrapper
      initialValues={props.initialValues}
      name={formName}
      isModal={props.isModal}
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
            component={RenderSelect}
            onChange={(party_guid) => props.handleSelectChange(party_guid)}
            data={props.contacts}
            allowClear
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
            {formValues?.party_guid
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
            data={partyRelationshipTypesList}
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
            data={transformOrganizations(organizations)}
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
        <RenderCancelButton />
        <RenderSubmitButton buttonText={getSubmitText()} disableOnClean={false} />
      </Row>
    </FormWrapper>
  );
};

export default AddContactFormDetails;
