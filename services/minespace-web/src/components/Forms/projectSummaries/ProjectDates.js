/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { maxLength } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const ProjectDates = (props) => (
  <>
    <h1>Project Dates</h1>
    <Field
      id="expected_draft_irt_submission_date"
      name="expected_draft_irt_submission_date"
      label="When do you anticipate submitting a draft IRT? (optional)"
      placeholder="Please select date"
      component={renderConfig.DATE}
    />
    <Field
      id="expected_permit_application_date"
      name="expected_permit_application_date"
      label="When do you anticipate submitting a permit application? (optional)"
      placeholder="Please select date"
      component={renderConfig.DATE}
    />
    <Field
      id="expected_permit_receipt_date"
      name="expected_permit_receipt_date"
      label="When do you hope to receive your permit/amendment(s)? (optional)"
      placeholder="Please select date"
      component={renderConfig.DATE}
    />
    <Field
      id="expected_project_start_date"
      name="expected_project_start_date"
      label="When do you anticipate starting work on this project? (optional)"
      placeholder="Please select date"
      component={renderConfig.DATE}
    />
  </>
);

ProjectDates.propTypes = propTypes;

export default ProjectDates;
