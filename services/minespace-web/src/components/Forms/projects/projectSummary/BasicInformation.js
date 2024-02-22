import React from "react";
import { Typography } from "antd";
import { Field } from "redux-form";
import { maxLength, required } from "@common/utils/Validate";
import RenderField from "@mds/common/components/forms/RenderField";
import RenderAutoSizeField from "@mds/common/components/forms/RenderAutoSizeField";

const propTypes = {};

export const BasicInformation = () => {
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
      />
      <Field
        id="proponent_project_id"
        name="proponent_project_id"
        label="Proponent project tracking ID"
        labelSubtitle="If your company uses a tracking number to identify projects, please provide it here."
        component={RenderField}
        validate={[maxLength(20)]}
      />
      <Field
        id="project_summary_description"
        name="project_summary_description"
        label="Project overview"
        labelSubtitle="Provide a 2-3 paragraph high-level description of your proposed project."
        required
        component={RenderAutoSizeField}
        minRows={10}
        validate={[maxLength(4000), required]}
      />
    </>
  );
};

BasicInformation.propTypes = propTypes;

export default BasicInformation;
