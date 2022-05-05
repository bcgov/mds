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
  uploadType: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
  maxFiles: PropTypes.number.isRequired,
};

export const NoticeOfDepartureFileUpload = (props) => {
  const { mineGuid, onFileLoad, onRemoveFile, uploadType, allowMultiple, maxFiles } = props;
  return (
    <Field
      id={uploadType}
      name={uploadType}
      component={FileUpload}
      maxFiles={maxFiles}
      uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(mineGuid)}
      acceptedFileTypesMap={{ ...DOCUMENT, ...EXCEL }}
      onFileLoad={onFileLoad}
      onRemoveFile={onRemoveFile}
      allowRevert
      allowMultiple={allowMultiple}
    />
  );
};

NoticeOfDepartureFileUpload.propTypes = propTypes;

export default NoticeOfDepartureFileUpload;
