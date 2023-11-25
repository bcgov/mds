import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { EXPLOSIVES_PERMIT_DOCUMENTS } from "@mds/common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  esupGuid: PropTypes.string.isRequired,
};

export const ExplosivesPermitFileUpload = (props) => {
  return (
    <Form.Item>
      <Field
        id="fileUpload"
        name="fileUpload"
        component={FileUpload}
        uploadUrl={EXPLOSIVES_PERMIT_DOCUMENTS(props.mineGuid, props.esupGuid)}
        acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
        onFileLoad={props.onFileLoad}
        onRemoveFile={props.onRemoveFile}
        allowRevert
        allowMultiple
      />
    </Form.Item>
  );
};

ExplosivesPermitFileUpload.propTypes = propTypes;

export default ExplosivesPermitFileUpload;
