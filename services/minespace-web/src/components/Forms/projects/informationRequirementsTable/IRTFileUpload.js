import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { INFORMATION_REQUIREMENTS_TABLE } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  importIrtSpreadsheet: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
  projectGuid: PropTypes.string.isRequired,
};

export const IRTFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={INFORMATION_REQUIREMENTS_TABLE(props.projectGuid)}
    acceptedFileTypesMap={props.acceptedFileTypesMap}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    importIrtSpreadsheet={props.importIrtSpreadsheet}
    projectGuid={props.projectGuid}
    allowRevert
  />
);

IRTFileUpload.propTypes = propTypes;

export default IRTFileUpload;
