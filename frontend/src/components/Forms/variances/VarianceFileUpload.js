import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "antd";
import { VARIANCE_DOCUMENTS } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const VarianceFileUpload = (props) => (
  <Form.Item>
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
  </Form.Item>
);

VarianceFileUpload.propTypes = propTypes;

export default VarianceFileUpload;
