import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { PROJECT_DECISION_PACKAGE_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  projectGuid: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
};

export const ProjectDecisionPackageFileUpload = (props) => (
  <Form.Item>
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={PROJECT_DECISION_PACKAGE_DOCUMENTS(props.projectGuid)}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL }}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      allowRevert
      allowMultiple={props.allowMultiple}
    />
  </Form.Item>
);

ProjectDecisionPackageFileUpload.propTypes = propTypes;

export default ProjectDecisionPackageFileUpload;
