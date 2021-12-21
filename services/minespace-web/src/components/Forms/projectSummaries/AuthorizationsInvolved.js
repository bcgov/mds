/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const AuthorizationsInvolved = (props) => (
  <>
    <h1>Authorizations Involves</h1>
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
