import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { DOCUMENT, EXCEL } from "@/constants/fileTypes";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export const NoticeOfDepartureFileUpload = (props) => {
  const { mineGuid, onFileLoad, onRemoveFile } = props;
  return (
    <Field
      id="fileUpload"
      name="fileUpload"
      component={FileUpload}
      uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(mineGuid)}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
      onFileLoad={onFileLoad}
      onRemoveFile={onRemoveFile}
      allowRevert
      allowMultiple
    />
  );
};

NoticeOfDepartureFileUpload.propTypes = propTypes;

export default NoticeOfDepartureFileUpload;
