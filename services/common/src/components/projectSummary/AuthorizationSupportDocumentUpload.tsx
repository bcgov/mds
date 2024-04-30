import React, { FC } from "react";
import { Field } from "redux-form";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import { MINE_REPORT_DOCUMENT, PROJECT_SUMMARY_DOCUMENTS } from "@mds/common/constants/API";
import RenderFileUpload from "../forms/RenderFileUpload";
import { required, requiredNewFiles } from "@mds/common/redux/utils/Validate";
import { IMineDocument } from "../..";

interface AuthorizationSupportDocumentUploadProps {
  mineGuid: string;
  isProponent: boolean;
  documents: IMineDocument[];
  updateDocuments: (documents: IMineDocument[]) => void;
  projectGuid: string;
  projectSummaryGuid: string;
}

export const AuthorizationSupportDocumentUpload: FC<AuthorizationSupportDocumentUploadProps> = ({
  mineGuid,
  isProponent,
  documents,
  updateDocuments,
  projectGuid,
  projectSummaryGuid,
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

  const handleFileLoad = (props) => {
    const {document_name, document_manager_guid} = props;
    console.log("________HANDLE----_______", props)
    console.log("handle File Load.....", document_name, " - ", document_manager_guid)
    console.log("documents: ", documents)
    const newDoc = { document_name, document_manager_guid } as IMineDocument;

    if(documents) {
      const newDocuments = [...documents, newDoc];
      updateDocuments(newDocuments)
    }else {
      updateDocuments([newDoc])
    }
  };

  const acceptedFileTypesMap = { ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL };

  return (
    <div>
      <Field
        id="LocationMapDocumentUpload"
        name="documents"
        label="Location Map"
        labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-08_location_map_form.pdf"
        component={RenderFileUpload}
        // validate={isProponent ? [requiredNewFiles] : [required]}
        required
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({projectGuid, projectSummaryGuid, mineGuid})}
        onFileLoad={handleFileLoad}
        onRemoveFile={handleRemoveFile}
      />
      <Field
        id="DischargeFactorFormUpload"
        name="documents"
        label="Discharge Factor Amendment Form (PDF, 318KB)"
        labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-06_amend_discharge_factor_amendment_form.pdf"
        component={RenderFileUpload}
        // validate={isProponent ? [requiredNewFiles] : [required]}
        required
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({projectGuid, projectSummaryGuid, mineGuid})}
        onFileLoad={handleFileLoad}
        onRemoveFile={handleRemoveFile}
      />
      <Field
        id="ExemptionLetterUpload"
        name="documents"
        label="Supporting Document"
        component={RenderFileUpload}
        // validate={isProponent ? [requiredNewFiles] : [required]}
        required
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({projectGuid, projectSummaryGuid, mineGuid})}
        onFileLoad={handleFileLoad}
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

export default AuthorizationSupportDocumentUpload;
