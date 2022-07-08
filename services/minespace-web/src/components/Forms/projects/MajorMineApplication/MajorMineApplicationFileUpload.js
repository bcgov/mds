import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { MAJOR_MINE_APPLICATION_DOCUMENTS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
  projectGuid: PropTypes.string.isRequired,
  uploadType: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  labelIdle: PropTypes.string.isRequired,
  maxFiles: PropTypes.number.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
};

export const MajorMineApplicationFileUpload = (props) => (
  <Field
    id={props.uploadType}
    name={props.uploadType}
    label={props.label}
    component={FileUpload}
    uploadUrl={MAJOR_MINE_APPLICATION_DOCUMENTS(props.projectGuid)}
    maxFiles={props.maxFiles}
    labelIdle={props.labelIdle}
    acceptedFileTypesMap={props.acceptedFileTypesMap}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple={props.allowMultiple}
  />
);

MajorMineApplicationFileUpload.propTypes = propTypes;

export default MajorMineApplicationFileUpload;
