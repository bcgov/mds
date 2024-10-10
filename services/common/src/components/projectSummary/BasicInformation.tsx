import React from "react";
import { Typography } from "antd";
import { Field, getFormValues } from "redux-form";
import { maxLength, required } from "@mds/common/redux/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";
import { useSelector } from "react-redux";
import { FORM, isFieldDisabled } from "@mds/common/constants";
import { getSystemFlag } from "@mds/common/redux/selectors/authenticationSelectors";

export const BasicInformation = () => {
  const formValues = useSelector(getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY));
  const systemFlag = useSelector(getSystemFlag);

  return (
    <>
      <Typography.Title level={3}>Basic Information</Typography.Title>
      <Field
        id="project_summary_title"
        name="project_summary_title"
        label="Project title"
        required
        component={RenderField}
        validate={[maxLength(300), required]}
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
      />
      <Field
        id="proponent_project_id"
        name="proponent_project_id"
        label="Proponent project tracking ID"
        labelSubtitle="If your company uses a tracking number to identify projects, please provide it here."
        component={RenderField}
        validate={[maxLength(20)]}
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Project overview"
        labelSubtitle="Provide a 2-3 paragraph high-level description of your proposed project."
        required
        component={RenderAutoSizeField}
        minRows={10}
        maximumCharacters={4000}
        validate={[maxLength(4000), required]}
        disabled={isFieldDisabled(systemFlag, formValues?.status_code)}
      />
    </>
  );
};

export default BasicInformation;
