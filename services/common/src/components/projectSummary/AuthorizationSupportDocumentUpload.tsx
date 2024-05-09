import React, { FC } from "react";
import { Field } from "redux-form";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import { PROJECT_SUMMARY_DOCUMENTS } from "@mds/common/constants/API";
import RenderFileUpload from "../forms/RenderFileUpload";
import { IProjectSummaryDocument } from "../..";
import { PROJECT_SUMMARY_DOCUMENT_TYPE_CODE } from "../..";

interface AuthorizationSupportDocumentUploadProps {
  mineGuid: string;
  isProponent: boolean;
  documents: IProjectSummaryDocument[];
  updateAmendmentDocuments: (documents: IProjectSummaryDocument) => void;
  projectGuid: string;
  projectSummaryGuid: string;
  dfaRequired: boolean;
}

export const AuthorizationSupportDocumentUpload: FC<AuthorizationSupportDocumentUploadProps> = ({
  mineGuid,
  isProponent,
  documents,
  updateAmendmentDocuments,
  projectGuid,
  projectSummaryGuid,
  dfaRequired,
}) => {
  const handleRemoveFile = (error, fileToRemove) => {
    if (error) {
      console.log(error);
    }
    const newDocuments = documents.filter(
      (file) => fileToRemove.serverId !== file.document_manager_guid
    );
    newDocuments.forEach((newDoc) => {
      updateAmendmentDocuments(newDoc);
    });
  };

  const handleFileLoad = (
    document_name: string,
    document_manager_guid: string,
    project_summary_document_type_code: string
  ) => {
    const newDoc = {
      document_name,
      document_manager_guid,
      project_summary_document_type_code,
    } as IProjectSummaryDocument;
    updateAmendmentDocuments(newDoc);
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
        required
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({ projectGuid, projectSummaryGuid, mineGuid })}
        onFileLoad={(document_name, document_manager_guid) =>
          handleFileLoad(
            document_name,
            document_manager_guid,
            PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.LOCATION_MAP
          )
        }
        onRemoveFile={handleRemoveFile}
      />
      <Field
        id="DischargeFactorFormUpload"
        name="documents"
        label="Discharge Factor Amendment Form (PDF, 318KB)"
        labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-06_amend_discharge_factor_amendment_form.pdf"
        component={RenderFileUpload}
        required={dfaRequired}
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({ projectGuid, projectSummaryGuid, mineGuid })}
        onFileLoad={(document_name, document_manager_guid) =>
          handleFileLoad(
            document_name,
            document_manager_guid,
            PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.DISCHARGE_FACTOR_AMENDMENT
          )
        }
        onRemoveFile={handleRemoveFile}
      />
      <Field
        id="ExemptionLetterUpload"
        name="documents"
        label="Supporting Document"
        component={RenderFileUpload}
        required={false}
        allowRevert
        allowMultiple
        acceptedFileTypesMap={acceptedFileTypesMap}
        listedFileTypes={["document", "image", "spreadsheet", "spatial"]}
        abbrevLabel={true}
        uploadUrl={PROJECT_SUMMARY_DOCUMENTS({ projectGuid, projectSummaryGuid, mineGuid })}
        onFileLoad={(document_name, document_manager_guid) =>
          handleFileLoad(
            document_name,
            document_manager_guid,
            PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SUPPORTING
          )
        }
        onRemoveFile={handleRemoveFile}
      />
    </div>
  );
};

export default AuthorizationSupportDocumentUpload;
