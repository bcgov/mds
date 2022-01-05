/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { Typography, Checkbox } from "antd";
import { Field, Fields, FormSection } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

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
  const [checked, setChecked] = useState([]);
  const handleChange = (e, code) => {
    if (e.target.checked) {
      setChecked((arr) => [code, ...arr]);
    } else {
      setChecked(checked.filter((item) => item !== code));
    }
  };

  const renderNestedFields = (code) => (
    <>
      <Field
        id="project_summary_permit_type"
        name="project_summary_permit_type"
        fieldName={`${code}.project_summary_permit_type`}
        options={options}
        formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
        change={props.change}
        component={renderConfig.GROUP_CHECK_BOX}
      />
      <Field
        id="existing_permits_authorizations"
        name="existing_permits_authorizations"
        label="Other Authorizations"
        component={renderConfig.FIELD}
        // validate={[maxLength(300)]}
      />
    </>
  );
  return (
    <>
      <Typography.Title level={3}>Authorizations Involved</Typography.Title>
      <Typography.Title level={5}>Mines Act</Typography.Title>
      <FormSection name="MINES_ACT_PERMIT">
        <Checkbox
          value="MINES_ACT_PERMIT"
          onChange={(e) => handleChange(e, "MINES_ACT_PERMIT")}
          checked={checked.includes("MINES_ACT_PERMIT")}
        >
          Mines Act Permit
        </Checkbox>
        {checked.includes("MINES_ACT_PERMIT") && renderNestedFields("MINES_ACT_PERMIT")}
      </FormSection>
      <Typography.Title level={5}>Environmental Management Act</Typography.Title>
      <Typography.Title level={5}>Water Sustainability Act</Typography.Title>
      <Typography.Title level={5}>Forestry Act</Typography.Title>
      <Typography.Title level={5}>Other Legislation</Typography.Title>
      <FormSection name="OTHER">
        <Checkbox
          value="OTHER"
          onChange={(e) => handleChange(e, "OTHER")}
          checked={checked.includes("OTHER")}
        >
          Other
        </Checkbox>
        {checked.includes("OTHER") && (
          <Field
            id="existing_permits_authorizations"
            name="existing_permits_authorizations"
            label="Other Authorizations"
            component={renderConfig.FIELD}
            // validate={[maxLength(300)]}
          />
        )}
      </FormSection>
    </>
  );
};

AuthorizationsInvolved.propTypes = propTypes;

export default AuthorizationsInvolved;
