/* eslint-disable */
import React from "react";
import PropTypes from "prop-types";
import { Typography } from "antd";
import { Field } from "redux-form";
import { maxLength, required } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

const propTypes = {};

export const BasicInformation = (props) => (
  <>
    <Typography.Title level={3}>Basic Information</Typography.Title>
    <Field
      id="project_summary_title"
      name="project_summary_title"
      label={<span className="bold">Project title</span>}
      component={renderConfig.AUTO_SIZE_FIELD}
      validate={[maxLength(300), required]}
    />
    <Field
      id="proponent_project_id"
      name="proponent_project_id"
      label={
        <>
          <span className="bold">Proponent project tracking ID (optional)</span> <br />
          If your company uses a tracking number to identify projects, please provide it here.
        </>
      }
      component={renderConfig.FIELD}
      validate={[maxLength(300)]}
    />
    <Field
      id="project_summary_description"
      name="project_summary_description"
      label={
        <>
          <span className="bold">Project overview</span> <br />
          Provide a 2-3 paragraph high-level description of your proposed project.
        </>
      }
      component={renderConfig.AUTO_SIZE_FIELD}
      minRows={10}
      validate={[maxLength(300), required]}
    />
  </>
);

BasicInformation.propTypes = propTypes;

export default BasicInformation;
