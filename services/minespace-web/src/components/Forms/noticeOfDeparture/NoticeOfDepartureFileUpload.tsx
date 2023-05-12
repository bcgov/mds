import React from "react";
import { Field, WrappedFieldProps } from "redux-form";
import { NOTICE_OF_DEPARTURE_DOCUMENTS } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { IAcceptedFileTypes } from "@mds/common";

interface NoticeOfDepartureFileUploadProps extends WrappedFieldProps {
  onFileLoad: (file: File) => void;
  onRemoveFile: (file: File) => void;
  mineGuid: string;
  uploadType: string;
  allowMultiple: boolean;
  maxFiles: number;
  setUploading: (uploading: boolean) => void;
  labelIdle?: string;
  acceptedFileTypesMap: IAcceptedFileTypes;
  beforeUpload?: (file: File) => void;
}

export const NoticeOfDepartureFileUpload: React.FC<NoticeOfDepartureFileUploadProps> = (props) => {
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

export default NoticeOfDepartureFileUpload;
