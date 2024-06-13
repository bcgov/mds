import React from "react";
import { useSelector } from "react-redux";
import { Field, getFormValues } from "redux-form";
import { Typography } from "antd";
import { dateNotBeforeOther, dateNotAfterOther } from "@mds/common/redux/utils/Validate";
import Callout from "@mds/common/components/common/Callout";
import { FORM } from "@mds/common/constants/forms";
import RenderDate from "@mds/common/components/forms/RenderDate";

export const ProjectDates = () => {
  const {
    expected_permit_application_date,
    expected_draft_irt_submission_date,
    expected_permit_receipt_date,
  } = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));

  return (
    <>
      <Typography.Title level={3}>Project Dates</Typography.Title>
      <Callout
        message={
          <>
            These dates are for guidance and planning purposes only and do not reflect actual
            delivery dates. The{" "}
            <a
              target="_blank"
              rel="noopener noreferrer"
              title="Major Mines Permitting Office"
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
        label="When do you anticipate submitting a draft Information Requirements Table?"
        placeholder="Please select date"
        component={RenderDate}
        validate={[dateNotAfterOther(expected_permit_application_date)]}
      />
      <Field
        id="expected_permit_application_date"
        name="expected_permit_application_date"
        label="When do you anticipate submitting a permit application?"
        placeholder="Please select date"
        component={RenderDate}
        validate={[dateNotBeforeOther(expected_draft_irt_submission_date)]}
      />
      <Field
        id="expected_permit_receipt_date"
        name="expected_permit_receipt_date"
        label="When do you hope to receive your permit/amendment(s)?"
        placeholder="Please select date"
        component={RenderDate}
        validate={[dateNotBeforeOther(expected_permit_application_date)]}
      />
      <Field
        id="expected_project_start_date"
        name="expected_project_start_date"
        label="When do you anticipate starting work on this project?"
        placeholder="Please select date"
        component={RenderDate}
        validate={[dateNotBeforeOther(expected_permit_receipt_date)]}
      />
    </>
  );
};

export default ProjectDates;
