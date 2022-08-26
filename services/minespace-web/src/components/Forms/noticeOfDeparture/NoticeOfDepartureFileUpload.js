import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";

const propTypes = {
  onFileLoad: PropTypes.func.isRequired,
  onRemoveFile: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  uploadType: PropTypes.string.isRequired,
  allowMultiple: PropTypes.bool.isRequired,
  maxFiles: PropTypes.number.isRequired,
  setUploading: PropTypes.func.isRequired,
  labelIdle: PropTypes.string,
  // eslint-disable-next-line react/forbid-prop-types
  acceptedFileTypesMap: PropTypes.object.isRequired,
  beforeUpload: PropTypes.func,
};

const defaultProps = {
  labelIdle: undefined,
  beforeUpload: () => {},
};

export const NoticeOfDepartureFileUpload = (props) => {
  const {
    mineGuid,
    onFileLoad,
    onRemoveFile,
    uploadType,
    allowMultiple,
    maxFiles,
    setUploading,
    acceptedFileTypesMap,
    labelIdle,
  } = props;
  return (
    <Field
      id={uploadType}
      name={uploadType}
      component={FileUpload}
      addFileStart={() => setUploading(true)}
      maxFiles={maxFiles}
      onAbort={() => setUploading(false)}
      uploadUrl={NOTICE_OF_DEPARTURE_DOCUMENTS(mineGuid)}
      acceptedFileTypesMap={acceptedFileTypesMap}
      onFileLoad={onFileLoad}
      labelIdle={labelIdle}
      onRemoveFile={onRemoveFile}
      allowRevert
      onprocessfiles={() => setUploading(false)}
      allowMultiple={allowMultiple}
      beforeAddFile={props.beforeUpload}
      beforeDropFile={props.beforeUpload}
    />
  );
};

NoticeOfDepartureFileUpload.propTypes = propTypes;
NoticeOfDepartureFileUpload.defaultProps = defaultProps;

export default NoticeOfDepartureFileUpload;
