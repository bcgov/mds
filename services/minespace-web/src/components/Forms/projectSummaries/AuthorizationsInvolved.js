/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Typography, Checkbox } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Field, Fields, FormSection } from "redux-form";
import { Form } from "@ant-design/compatible";
import { getFormValues } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import Callout from "@/components/common/Callout";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@common/selectors/staticContentSelectors";
import { getFormattedProjectSummary } from "@common/selectors/projectSummarySelectors";

const propTypes = {};

export const AuthorizationsInvolved = (props) => {
  const [checked, setChecked] = useState(
    props.formattedProjectSummary ? props.formattedProjectSummary.authorizationOptions : []
  );
  const handleChange = (e, code) => {
    if (e.target.checked) {
      setChecked((arr) => [code, ...arr]);
    } else {
      setChecked(checked.filter((item) => item !== code));
    }
  };

  const setInitialValues = (authorizationType, formValues) => {
    const currentAuthorizationType = formValues?.authorizations?.find(
      (val) => val?.project_summary_authorization_type === authorizationType
    );
    return currentAuthorizationType?.project_summary_permit_type ?? [];
  };

  const renderNestedFields = (code) => (
    <div className="nested-container">
      {code !== "OTHER" && (
        <>
          <Field
            id="project_summary_permit_type"
            name="project_summary_permit_type"
            fieldName={`${code}.project_summary_permit_type`}
            options={props.dropdownProjectSummaryPermitTypes}
            formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
            formValues={props.formattedProjectSummary.summary}
            change={props.change}
            component={renderConfig.GROUP_CHECK_BOX}
            label="What type of permit is involved in your application?"
            setInitialValues={() => setInitialValues(code, props.formattedProjectSummary.summary)}
          />
        </>
      )}
      <Field
        id="existing_permits_authorizations"
        name="existing_permits_authorizations"
        label={
          <>
            If your application involved a change to an existing permit, please list the numbers of
            the permits involved.
            <br />
            <span className="light--sm">Please separate each permit number with a comma</span>
          </>
        }
        component={renderConfig.FIELD}
      />
    </div>
  );

  return (
    <>
      <Typography.Title level={3}>
        Authorizations potentially involved in the project
      </Typography.Title>
      <Callout message="Please select the authorizations that you anticipate needing for this project, based on your current understanding. This is to assist in planning and may not be the complete list for the final application." />
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
                      {checked.includes(child.code) ? (
                        <>
                          {child.description} <DownOutlined />
                        </>
                      ) : (
                        child.description
                      )}
                    </Checkbox>
                    {checked.includes(child.code) && renderNestedFields(child.code)}
                  </FormSection>
                );
              })}
            <br />
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
  formattedProjectSummary: getFormattedProjectSummary(state),
  formValues: getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)(state),
});

export default connect(mapStateToProps)(AuthorizationsInvolved);
