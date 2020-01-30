import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "antd";
import { PERMITS } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
};

export const PermitAmendmentFileUpload = (props) => (
  <Form.Item>
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={`${PERMITS(props.mineGuid)}/amendments/documents`}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      allowRevert
      allowMultiple={props.allowMultiple}
    />
  </Form.Item>
);

PermitAmendmentFileUpload.propTypes = propTypes;

export default PermitAmendmentFileUpload;
