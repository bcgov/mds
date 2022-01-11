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
      label="Project title"
      component={renderConfig.FIELD}
      validate={[maxLength(300), required]}
    />
    <Field
      id="proponent_project_id"
      name="proponent_project_id"
      label={
        <>
          Proponent project tracking ID (optional)
          <br />
          <span className="light--sm">
            If your company uses a tracking number to identify projects, please provide it here.
          </span>
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
          Project overview <br />
          <span className="light--sm">
            {" "}
            Provide a 2-3 paragraph high-level description of your proposed project.
          </span>
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
