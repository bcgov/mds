import React, { FC } from "react";
import { Field } from "redux-form";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import { MINE_REPORT_DOCUMENT } from "@mds/common/constants/API";
import RenderFileUpload from "../forms/RenderFileUpload";
import { required, requiredNewFiles } from "@mds/common/redux/utils/Validate";
import { IMineDocument } from "../..";

interface ReportFileUploadProps {
  mineGuid: string;
  isProponent: boolean;
  documents: IMineDocument[];
  updateDocuments: (documents: IMineDocument[]) => void;
}

export const ReportFileUpload: FC<ReportFileUploadProps> = ({
  mineGuid,
  isProponent,
  documents,
  updateDocuments,
}) => {
  const handleRemoveFile = (error, fileToRemove) => {
    if (error) {
      console.log(error);
    }
    const newDocuments = documents.filter(
      (file) => fileToRemove.serverId !== file.document_manager_guid
    );
    updateDocuments(newDocuments);
  };

  const handleFileLoad = (document_name, document_manager_guid) => {
    const newDoc = { document_name, document_manager_guid } as IMineDocument;
    const newDocuments = [...documents, newDoc];
    updateDocuments(newDocuments);
  };

  const acceptedFileTypesMap = { ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL };

  return (
    <div>
      <Field
        id="ReportFileUpload"
        name="documents"
        label="Upload Files"
        component={RenderFileUpload}
        validate={isProponent ? [requiredNewFiles] : [required]}
        required
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        uploadUrl={MINE_REPORT_DOCUMENT(mineGuid)}
        onFileLoad={handleFileLoad}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

export default ReportFileUpload;
