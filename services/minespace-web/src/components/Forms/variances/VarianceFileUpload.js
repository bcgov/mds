import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { DOCUMENT, EXCEL } from "@mds/common/constants/fileTypes";
import { VARIANCE_DOCUMENTS } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const VarianceFileUpload = (props) => (
  <Field
    id="fileUpload"
    name="fileUpload"
    component={FileUpload}
    uploadUrl={VARIANCE_DOCUMENTS(props.mineGuid)}
    acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
    onFileLoad={props.onFileLoad}
    onRemoveFile={props.onRemoveFile}
    allowRevert
    allowMultiple
  />
);

VarianceFileUpload.propTypes = propTypes;

export default VarianceFileUpload;
