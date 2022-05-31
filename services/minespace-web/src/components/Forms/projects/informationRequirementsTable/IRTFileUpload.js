import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { INFORMATION_REQUIREMENTS_TABLE_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  createInformationRequirementsTable: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
  projectGuid: PropTypes.string.isRequired,
};

export const IRTFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={INFORMATION_REQUIREMENTS_TABLE_DOCUMENTS(props.projectGuid)}
    acceptedFileTypesMap={props.acceptedFileTypesMap}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple={false}
    afterSuccess={{
      action: props.createInformationRequirementsTable,
      actionGuid: props.projectGuid,
    }}
  />
);

IRTFileUpload.propTypes = propTypes;

export default IRTFileUpload;
