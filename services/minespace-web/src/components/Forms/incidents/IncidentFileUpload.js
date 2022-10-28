import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { MINE_INCIDENT_DOCUMENTS } from "@common/constants/API";
import { DOCUMENT, EXCEL, SPATIAL } from "@common/constants/fileTypes";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const IncidentFileUpload = (props) => (
  <Form.Item>
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={MINE_INCIDENT_DOCUMENTS(props.mineGuid)}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...SPATIAL }}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      allowRevert
      allowMultiple
    />
  </Form.Item>
);

IncidentFileUpload.propTypes = propTypes;

export default IncidentFileUpload;
