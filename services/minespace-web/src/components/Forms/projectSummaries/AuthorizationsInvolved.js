/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Typography } from "antd";
import { Field, FormSection } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const AuthorizationsInvolved = (props) => (
  <>
    <Typography.Title level={3}>Authorizations Involved</Typography.Title>
    <FormSection name="authorizations"></FormSection>
    {/* <Field
      id="project_summary_date"
      name="project_summary_date"
      label="Date"
      placeholder="Please select date"
      component={renderConfig.DATE}
    />
    <Field
      id="project_summary_description"
      name="project_summary_description"
      label="Description of Work"
      component={renderConfig.AUTO_SIZE_FIELD}
      validate={[maxLength(300)]}
    /> */}
  </>
);

AuthorizationsInvolved.propTypes = propTypes;

export default AuthorizationsInvolved;
