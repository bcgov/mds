import React, { FC } from "react";
import { Field } from "redux-form";
import { DOCUMENT, EXCEL, IMAGE, SPATIAL } from "@mds/common/constants/fileTypes";
import { PROJECT_SUMMARY_DOCUMENTS } from "@mds/common/constants/API";
import RenderFileUpload from "@mds/common/components/forms/RenderFileUpload";
import { IProjectSummaryDocument } from "../..";
import {
  PROJECT_SUMMARY_DOCUMENT_TYPE_CODE,
  DISCHARGE_FACTOR_FORM_AMENDMENT,
  DISCHARGE_FACTOR_FORM_NEW,
} from "../..";
import { requiredList } from "@mds/common/redux/utils/Validate";

interface AuthorizationSupportDocumentUploadProps {
  mineGuid: string;
  documents: IProjectSummaryDocument[];
  updateAmendmentDocument: (document: IProjectSummaryDocument) => void;
  removeAmendmentDocument: (
    amendmentDocumentsIndex: number,
    category: string,
    document_manager_guid: string
  ) => void;
  projectGuid: string;
  projectSummaryGuid: string;
  code: string;
  showExemptionSection: boolean;
  isAmendment: boolean;
  amendmentChanges: string[];
  isDisabled: boolean;
}

export const AuthorizationSupportDocumentUpload: FC<AuthorizationSupportDocumentUploadProps> = ({
  mineGuid,
  documents,
  updateAmendmentDocument,
  removeAmendmentDocument,
  projectGuid,
  projectSummaryGuid,
  showExemptionSection,
  isAmendment,
  amendmentChanges,
  isDisabled,
}) => {
  const handleRemoveFile = (error, fileToRemove) => {
    if (error) {
      console.log(error);
    }

    const amendmentDocumentsIndex = documents.findIndex(
      (doc) => fileToRemove.serverId === doc.document_manager_guid
    );
    const amendmentDocument = documents.find(
      (doc) => fileToRemove.serverId === doc.document_manager_guid
    );
    const category =
      amendmentDocument.category || amendmentDocument.project_summary_document_type_code;

    removeAmendmentDocument(amendmentDocumentsIndex, category, fileToRemove.serverId);
  };

  const handleFileLoad = (
    document_name: string,
    document_manager_guid: string,
    project_summary_document_type_code: string
  ) => {
    const newDocument = {
      document_name,
      document_manager_guid,
      project_summary_document_type_code,
    } as IProjectSummaryDocument;

    updateAmendmentDocument(newDocument);
  };

  const isDocumentTypeRequired = (type) => {
    let valuesToCheckFor = [];
    if (type === "DFA") {
      valuesToCheckFor = ["ILT", "IGT", "DDL"];
    } else if (type === "CSL") {
      valuesToCheckFor = ["TRA"];
    } else if (type === "CON") {
      valuesToCheckFor = ["TRA", "NAM"];
    } else if (type === "CAF") {
      valuesToCheckFor = ["MMR", "RCH", "ILT", "IGT", "DDL"];
    }

    return amendmentChanges?.some((val) => valuesToCheckFor.includes(val));
  };

  const acceptedFileTypesMap = { ...DOCUMENT, ...EXCEL, ...IMAGE, ...SPATIAL };

  return (
    <div>
      {!isDisabled && (
        <Field
          id="LocationMapDocumentUpload"
          name="location_documents"
          label="Location Map"
          labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-08_location_map_form.pdf"
          component={RenderFileUpload}
          required
          validate={[requiredList]}
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
      )}
      {!isDisabled &&
        (!isAmendment ||
          (isAmendment &&
            isDocumentTypeRequired(PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.DISCHARGE_FACTOR))) && (
          <Field
            id="DischargeFactorFormUpload"
            name="discharge_documents"
            label="Discharge Factor Form (PDF, 318KB)"
            labelHref={isAmendment ? DISCHARGE_FACTOR_FORM_AMENDMENT : DISCHARGE_FACTOR_FORM_NEW}
            component={RenderFileUpload}
            required
            validate={[requiredList]}
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
                PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.DISCHARGE_FACTOR
              )
            }
            onRemoveFile={handleRemoveFile}
          />
        )}
      {!isDisabled && isAmendment && (
        <div>
          {isDocumentTypeRequired(PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CONSENT_LETTER) && (
            <Field
              id="ConsentLetterUpload"
              name="consent_documents"
              label="Consent Letter"
              component={RenderFileUpload}
              required
              validate={[requiredList]}
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
                  PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CONSENT_LETTER
                )
              }
              onRemoveFile={handleRemoveFile}
            />
          )}
          {!isDisabled &&
            isDocumentTypeRequired(PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CLAUSE_AMENDMENT_FORM) && (
              <Field
                id="ClauseAmendmentFormUpload"
                name="clause_amendment_documents"
                label="Clause Amendment Form (PDF, 276KB)"
                labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-07_amend_clause_amendment_form.pdf"
                component={RenderFileUpload}
                required
                validate={[requiredList]}
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
                    PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CLAUSE_AMENDMENT_FORM
                  )
                }
                onRemoveFile={handleRemoveFile}
              />
            )}
          {!isDisabled &&
            isDocumentTypeRequired(
              PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CHANGE_OF_OWNERSHIP_NAME_OR_ADDRESS_FORM
            ) && (
              <Field
                id="ChangeOfOwnershipNameOrAddressFormUpload"
                name="change_ownership_name_documents"
                label="Change of Ownership, Name or Address Form (PDF, 464KB)"
                labelHref="https://www2.gov.bc.ca/assets/gov/environment/waste-management/waste-discharge-authorization/guides/forms/epd-ema-a2_change_of_ownership_name_or_address_form.pdf"
                component={RenderFileUpload}
                required
                validate={[requiredList]}
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
                    PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.CHANGE_OF_OWNERSHIP_NAME_OR_ADDRESS_FORM
                  )
                }
                onRemoveFile={handleRemoveFile}
              />
            )}
        </div>
      )}
      {!isDisabled && showExemptionSection && (
        <Field
          id="ExemptionLetterUpload"
          name="exemption_documents"
          label="Exemption Letter with Rationale"
          component={RenderFileUpload}
          required
          validate={[requiredList]}
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
              PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.EXEMPTION_LETTER
            )
          }
          onRemoveFile={handleRemoveFile}
        />
      )}
      {!isDisabled && (
        <Field
          id="SupportDocumentUpload"
          name="support_documents"
          label="Supporting Document"
          component={RenderFileUpload}
          required={showExemptionSection}
          validate={showExemptionSection ? [requiredList] : []}
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
      )}
    </div>
  );
};

export default AuthorizationSupportDocumentUpload;
