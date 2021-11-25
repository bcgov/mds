import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { PROJECT_SUMMARY_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const ProjectSummaryFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={PROJECT_SUMMARY_DOCUMENTS(props.mineGuid)}
    acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple
  />
);

ProjectSummaryFileUpload.propTypes = propTypes;

export default ProjectSummaryFileUpload;
