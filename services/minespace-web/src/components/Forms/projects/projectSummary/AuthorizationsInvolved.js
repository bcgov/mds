import React, { useState } from "react";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Typography, Checkbox, Tooltip } from "antd";
import { DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Field, FormSection, change, getFormValues } from "redux-form";
import {
  getTransformedProjectSummaryAuthorizationTypes,
  getDropdownProjectSummaryPermitTypes,
} from "@common/selectors/staticContentSelectors";
import { getFormattedProjectSummary } from "@common/selectors/projectSelectors";
import { requiredRadioButton } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";
import Callout from "@/components/common/Callout";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  formattedProjectSummary: PropTypes.objectOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)])
  ).isRequired,
  change: PropTypes.func.isRequired,
  dropdownProjectSummaryPermitTypes: CustomPropTypes.options.isRequired,
  transformedProjectSummaryAuthorizationTypes: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.string)
  ).isRequired,
};

export const AuthorizationsInvolved = (props) => {
  const [checked, setChecked] = useState(
    props.formattedProjectSummary ? props.formattedProjectSummary.authorizationOptions : []
  );
  const handleChange = (e, code) => {
    if (e.target.checked) {
      setChecked((arr) => [code, ...arr]);
    } else {
      setChecked(checked.filter((item) => item !== code));
      props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, code, null);
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
            formValues={props.formattedProjectSummary}
            change={props.change}
            component={renderConfig.GROUP_CHECK_BOX}
            label="What type of permit is involved in your application?"
            setInitialValues={() => setInitialValues(code, props.formattedProjectSummary)}
          />
        </>
      )}
      <Field
        id={`${code}.existing_permits_authorizations`}
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
      <Callout
        message="Please select the authorizations that you anticipate needing for this project, based
        on your current understanding. This is to assist in planning and may not be the
        complete list for the final application."
      />
      <br />
      <Typography.Title level={5}>
        Mines Review Committee
        <Tooltip
          overlayClassName="minespace-tooltip"
          title={
            <p>
              Learn more about the{" "}
              <a
                href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/coordinated-authorizations/mine-mrc#:~:text=A%20Mine%20Review%20Committee%20(MRC,of%20the%20coordinated%20authorizations%20process."
                target="_blank"
                rel="noopener noreferrer"
              >
                Mines Review Committee
              </a>
              .
            </p>
          }
          placement="right"
          mouseEnterDelay={0.3}
        >
          <InfoCircleOutlined className="padding-sm" />
        </Tooltip>
      </Typography.Title>
      <Field
        id="mrc_review_required"
        name="mrc_review_required"
        fieldName="mrc_review_required"
        formName={FORM.ADD_EDIT_PROJECT_SUMMARY}
        label={
          <>
            <p>
              Mine review committees (MRCs) are a key part of the coordinated authorizations
              process. An MRC is an advisory committee established by the Chief Permitting Officer
              (CPO) under Section 9 of the Mines Act. By bringing together multiple ministries,
              Indigenous nations, federal and local governments, and other reviewers, MRCs increase
              efficiency and effectiveness by reducing duplication of effort and by focusing on the
              project as a whole.
            </p>
            <p>
              <b>
                Does your project require a coordinated review by a Mine Review Committee, under
                Section 9 of the Mines Act?
              </b>{" "}
              This response will be reviewed by the Major Mines Office and confirmed by the Chief
              Permitting Officer.
            </p>
          </>
        }
        component={renderConfig.RADIO}
        validate={[requiredRadioButton]}
      />
      <br />
      {props.transformedProjectSummaryAuthorizationTypes.map((authorization) => {
        return (
          <React.Fragment key={authorization.code}>
            <Typography.Title level={5}>{authorization.description}</Typography.Title>
            {authorization.children &&
              authorization.children.map((child) => {
                return (
                  <FormSection name={child.code} key={`${authorization}.${child.code}`}>
                    <Checkbox
                      key={child.code}
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
          </React.Fragment>
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

const mapDispatchToProps = (dispatch) => bindActionCreators({ change }, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AuthorizationsInvolved);
