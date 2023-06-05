import React from "react";
import PropTypes from "prop-types";
import { Field, formValueSelector } from "redux-form";
import { Typography } from "antd";
import { connect } from "react-redux";
import { dateNotBeforeOther, dateNotAfterOther } from "@common/utils/Validate";
import Callout from "@/components/common/Callout";
import { renderConfig } from "@/components/common/config";
import * as FORM from "@/constants/forms";

const propTypes = {
  expected_permit_application_date: PropTypes.string,
  expected_draft_irt_submission_date: PropTypes.string,
  expected_permit_receipt_date: PropTypes.string,
};

const defaultProps = {
  expected_permit_application_date: undefined,
  expected_draft_irt_submission_date: undefined,
  expected_permit_receipt_date: undefined,
};

export const ProjectDates = (props) => {
  return (
    <>
      <Typography.Title level={3}>Project Dates</Typography.Title>
      <Callout
        message={
          <>
            These dates are for guidance and planning purposes only and do not reflect actual delivery
            dates. The{" "}
            <a
              target="_blank"
              rel="noreferrer"
              alt="Major Mines Permitting Office"
              href="https://www2.gov.bc.ca/gov/content/industry/mineral-exploration-mining/permitting/major-mines-permitting-office"
            >
              Major Mines Office
            </a>{" "}
            will work with you on a more definitive schedule.
          </>
        }
      />
      <Field
        id="expected_draft_irt_submission_date"
        name="expected_draft_irt_submission_date"
        label="When do you anticipate submitting a draft Information Requirements Table? (optional)"
        placeholder="Please select date"
        component={renderConfig.DATE}
        validate={[dateNotAfterOther(props.expected_permit_application_date)]}
      />
      <Field
        id="expected_permit_application_date"
        name="expected_permit_application_date"
        label="When do you anticipate submitting a permit application? (optional)"
        placeholder="Please select date"
        component={renderConfig.DATE}
        validate={[dateNotBeforeOther(props.expected_draft_irt_submission_date)]}
      />
      <Field
        id="expected_permit_receipt_date"
        name="expected_permit_receipt_date"
        label="When do you hope to receive your permit/amendment(s)? (optional)"
        placeholder="Please select date"
        component={renderConfig.DATE}
        validate={[dateNotBeforeOther(props.expected_permit_application_date)]}
      />
      <Field
        id="expected_project_start_date"
        name="expected_project_start_date"
        label="When do you anticipate starting work on this project? (optional)"
        placeholder="Please select date"
        component={renderConfig.DATE}
        validate={[dateNotBeforeOther(props.expected_permit_receipt_date)]}
      />
    </>
  )
};

ProjectDates.propTypes = propTypes;
ProjectDates.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  expected_draft_irt_submission_date: selector(state, "expected_draft_irt_submission_date"),
  expected_permit_application_date: selector(state, "expected_permit_application_date"),
  expected_permit_receipt_date: selector(state, "expected_permit_receipt_date"),
});

export default connect(mapStateToProps)(ProjectDates);
