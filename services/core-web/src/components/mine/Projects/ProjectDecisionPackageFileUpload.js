import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { PROJECT_DECISION_PACKAGE_DOCUMENTS } from "@mds/common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@/constants/fileTypes";
import { MAX_DOCUMENT_NAME_LENGTHS } from "@mds/common";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  projectGuid: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
};

export const ProjectDecisionPackageFileUpload = (props) => (
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
    maxFileNameLength={MAX_DOCUMENT_NAME_LENGTHS.MAJOR_PROJECTS}
    abbrevLabel={true}
    label="Upload Files"
  />
);

ProjectDecisionPackageFileUpload.propTypes = propTypes;

export default ProjectDecisionPackageFileUpload;
