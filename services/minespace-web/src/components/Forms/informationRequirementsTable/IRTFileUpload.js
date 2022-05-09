import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { IRT_TEMPLATE_DOWNLOAD } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  acceptedFileTypesMap: PropTypes.objectOf(PropTypes.string).isRequired,
};

export const IRTFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={IRT_TEMPLATE_DOWNLOAD}
    acceptedFileTypesMap={props.acceptedFileTypesMap}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple
  />
);

IRTFileUpload.propTypes = propTypes;

export default IRTFileUpload;
