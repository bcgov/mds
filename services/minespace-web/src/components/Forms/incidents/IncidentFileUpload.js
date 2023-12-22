import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { MINE_INCIDENT_DOCUMENTS } from "@mds/common/constants/API";
import { DOCUMENT, EXCEL, SPATIAL, IMAGE, MESSAGE } from "@mds/common/constants/fileTypes";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  labelIdle: PropTypes.string,
};

const defaultProps = {
  labelIdle: undefined,
};

export const IncidentFileUpload = (props) => (
  <Form.Item>
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={MINE_INCIDENT_DOCUMENTS(props.mineGuid)}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL, ...SPATIAL, ...IMAGE, ...MESSAGE }}
      onFileLoad={props.onFileLoad}
      onRemoveFile={props.onRemoveFile}
      allowRevert
      allowMultiple
      labelIdle={props.labelIdle}
    />
  </Form.Item>
);

IncidentFileUpload.propTypes = propTypes;
IncidentFileUpload.defaultProps = defaultProps;

export default IncidentFileUpload;
