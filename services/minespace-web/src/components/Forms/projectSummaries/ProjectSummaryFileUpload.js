import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { PROJECT_SUMMARY_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const ProjectSummaryFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={PROJECT_SUMMARY_DOCUMENTS(props.mineGuid)}
    acceptedFileTypesMap={props.acceptedFileTypesMap}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple
  />
);

ProjectSummaryFileUpload.propTypes = propTypes;

export default ProjectSummaryFileUpload;
