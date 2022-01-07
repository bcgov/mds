/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Typography, Checkbox } from "antd";
import { Field, Fields, FormSection } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@common/selectors/staticContentSelectors";

const propTypes = {};

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
      {code !== "OTHER" && (
        <Field
          id="project_summary_permit_type"
          name="project_summary_permit_type"
          fieldName={`${code}.project_summary_permit_type`}
          options={props.dropdownProjectSummaryPermitTypes}
          formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
          change={props.change}
          component={renderConfig.GROUP_CHECK_BOX}
        />
      )}
      <Field
        id="existing_permits_authorizations"
        name="existing_permits_authorizations"
        label="Other Authorizations"
        component={renderConfig.FIELD}
      />
    </>
  );

  return (
    <>
      <Typography.Title level={3}>Authorizations Involved</Typography.Title>
      {props.transformedProjectSummaryAuthorizationTypes.map((authorization) => {
        return (
          <>
            <Typography.Title level={5}>{authorization.description}</Typography.Title>
            {authorization.children &&
              authorization.children.map((child) => {
                return (
                  <FormSection name={child.code}>
                    <Checkbox
                      value={child.code}
                      onChange={(e) => handleChange(e, child.code)}
                      checked={checked.includes(child.code)}
                    >
                      {child.description}
                    </Checkbox>
                    {checked.includes(child.code) && renderNestedFields(child.code)}
                  </FormSection>
                );
              })}
          </>
        );
      })}
    </>
  );
};

AuthorizationsInvolved.propTypes = propTypes;

const mapStateToProps = (state) => ({
  transformedProjectSummaryAuthorizationTypes: getTransformedProjectSummaryAuthorizationTypes(
    state
  ),
  dropdownProjectSummaryPermitTypes: getDropdownProjectSummaryPermitTypes(state),
});

export default connect(mapStateToProps)(AuthorizationsInvolved);
