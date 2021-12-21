/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const BasicInformation = (props) => (
  <>
    <Field
      id="project_summary_title"
      name="project_summary_title"
      label="Project title"
      component={renderConfig.AUTO_SIZE_FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="proponent_project_id"
      name="proponent_project_id"
      label="Proponent project tracking ID (optional)"
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="project_summary_description"
      name="project_summary_description"
      label="Project overview"
      component={renderConfig.AUTO_SIZE_FIELD}
      validate={[maxLength(300)]}
    />
  </>
);

BasicInformation.propTypes = propTypes;

export default BasicInformation;
