/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Typography } from "antd";
import { Field, Fields, FormSection } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

const minesAct = [{ label: "Mines Act Permit", value: "MINES_ACT_PERMIT" }];

const EMA = [
  { label: "Air emissions discharge permit", value: "AIR_EMISSIONS_DISCHARGE_PERMIT" },
  { label: "Effluent discharge permit", value: "EFFLUENT_DISCHARGE_PERMIT" },
  { label: "Solid wastes permit", value: "SOLID_WASTES_PERMIT" },
  { label: "Municipal wastewater regulation", value: "MUNICIPAL_WASTEWATER_REGULATION" },
];

const WSA = [
  { label: "Change approval", value: "CHANGE_APPROVAL" },
  { label: "Use approval", value: "USE_APPROVAL" },
  { label: "Water licence", value: "WATER_LICENCE" },
];

const FA = [{ label: "Occupant licence to cut", value: "OCCUPANT_CUT_LICENCE" }];
const other = [{ label: "Other legislation", value: "OTHER" }];

const options = [
  { label: "New", value: "NEW" },
  { label: "Amendement to an existing permit", value: "AMENDMENT" },
  { label: "Notification", value: "NOTIFICATION" },
  { label: "Closure of an existing permit", value: "CLOSURE" },
  { label: "Other", value: "OTHER" },
];

export const AuthorizationsInvolved = (props) => {
  const handleChange = (e) => {
    if (e.target.value) {
      console.log(e.target.value);
    } else {
      console.log(e.target.value);
    }
  };
  return (
    <>
      <Typography.Title level={3}>Authorizations Involved</Typography.Title>
      {/* <FormSection name="authorizations"> */}
      <Typography.Title level={5}>Mines Act</Typography.Title>
      <FormSection name="mines_act">
        <Field
          id="MINES_ACT_PERMIT"
          name="MINES_ACT_PERMIT"
          label="Mines Act Permit"
          component={renderConfig.CHECK_BOX}
        />
        <Field
          id="project_summary_permit_type"
          name="MINES_ACT_PERMIT.project_summary_permit_type"
          options={options}
          change={props.change}
          component={renderConfig.GROUP_CHECK_BOX}
        />
        <Field
          id="existing_permits_authorizations"
          name="MINES_ACT_PERMIT.existing_permits_authorizations"
          label="Other Authorizations"
          component={renderConfig.FIELD}
          // validate={[maxLength(300)]}
        />
      </FormSection>
      <Typography.Title level={5}>Environmental Management Act</Typography.Title>
      {/* <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Air emissions discharge permit"
        options={EMA}
        component={renderConfig.GROUP_CHECK_BOX}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Effluent discharge permit"
        options={EMA}
        component={renderConfig.GROUP_CHECK_BOX}
      /> */}
      <Field
        id="SOLID_WASTE"
        name="SOLID_WASTE"
        label="solid waste permit"
        component={renderConfig.CHECK_BOX}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Municipal wastewater regulation"
        component={renderConfig.CHECK_BOX}
      />
      <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Change approval"
        component={renderConfig.CHECK_BOX}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Use approval"
        component={renderConfig.CHECK_BOX}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="water license"
        component={renderConfig.CHECK_BOX}
      />
      <Typography.Title level={5}>Forestry Act</Typography.Title>
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Occupant licence to cut"
        component={renderConfig.CHECK_BOX}
      />
      <Typography.Title level={5}>Other Legislation</Typography.Title>
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Other"
        component={renderConfig.CHECK_BOX}
      />
      {/* </FormSection> */}
    </>
  );
};

AuthorizationsInvolved.propTypes = propTypes;

export default AuthorizationsInvolved;
