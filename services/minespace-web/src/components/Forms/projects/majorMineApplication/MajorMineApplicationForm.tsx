import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Field, change, formValueSelector } from "redux-form";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Typography, Button } from "antd";
import { required } from "@common/utils/Validate";
import {
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE,
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE,
} from "@mds/common/constants/strings";
import { DOCUMENT, Feature, MODERN_EXCEL, SPATIAL, SPATIAL_DATA_STANDARDS_URL } from "@mds/common";
import * as routes from "@/constants/routes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import DocumentTable from "@/components/common/DocumentTable";
import MajorMineApplicationFileUpload from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";
import ArchivedDocumentsSection from "@common/components/documents/ArchivedDocumentsSection";
import { openModal } from "@mds/common/redux/actions/modalActions";
import AddSpatialDocumentsModal from "@mds/common/components/documents/spatial/AddSpatialDocumentsModal";
import SpatialDocumentTable from "@mds/common/components/documents/spatial/SpatialDocumentTable";
import * as API from "@mds/common/constants/API";
import { useFeatureFlag } from "@mds/common/providers/featureFlags/useFeatureFlag";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface MajorMineApplicationFormProps {
  project: any;
  handleSubmit: () => void;
  refreshData: () => void;
}

const MajorMineApplicationForm: React.FC<MajorMineApplicationFormProps> = ({
  project,
  handleSubmit,
  refreshData,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const { isFeatureEnabled } = useFeatureFlag();

  const acceptedFileTypesMap = {
    ...SPATIAL,
    ...DOCUMENT,
    ...MODERN_EXCEL,
  };

  const dispatch = useDispatch();

  const primaryDocuments = useSelector((state: any) =>
    formValueSelector(FORM.ADD_MINE_MAJOR_APPLICATION)(state, "primary_documents")
  );
  const spatialDocuments = useSelector((state: any) =>
    formValueSelector(FORM.ADD_MINE_MAJOR_APPLICATION)(state, "spatial_documents")
  );
  const supportingDocuments = useSelector((state: any) =>
    formValueSelector(FORM.ADD_MINE_MAJOR_APPLICATION)(state, "supporting_documents")
  );

  const onFileLoad = (
    fileName: string,
    document_manager_guid: string,
    documentTypeCode: string,
    documentTypeField: string
  ) => {
    const newFiles = [
      ...uploadedFiles,
      {
        document_name: fileName,
        document_manager_guid,
        major_mine_application_document_type_code: documentTypeCode,
        mine_guid: project?.mine_guid,
      },
    ];
    setUploadedFiles(newFiles);
    dispatch(
      change(
        FORM.ADD_MINE_MAJOR_APPLICATION,
        documentTypeField,
        newFiles.filter(
          (file) => file?.major_mine_application_document_type_code === documentTypeCode
        )
      )
    );
  };

  const onRemoveFile = (
    err: any,
    fileItem: any,
    documentTypeFieldForm: string,
    documentsForm: any[]
  ) => {
    const newFiles = uploadedFiles.filter(
      (file) => file.document_manager_guid !== fileItem.serverId
    );
    setUploadedFiles(newFiles);

    const newDocumentsForm = documentsForm.filter(
      (doc) => doc.document_manager_guid !== fileItem.serverId
    );

    dispatch(change(FORM.ADD_MINE_MAJOR_APPLICATION, documentTypeFieldForm, newDocumentsForm));
  };

  const uniqueDocs = (formDocuments: any[], mmaDocuments: any[], type_code: string) => {
    const validFormDocuments = Array.isArray(formDocuments) ? formDocuments : [];

    const documents = [
      ...validFormDocuments,
      ...(Array.isArray(mmaDocuments)
        ? mmaDocuments.filter((doc) => doc.major_mine_application_document_type_code === type_code)
        : []),
    ];
    const document_manager_guids = documents.map((o) => o.document_manager_guid);

    if (documents.length > 0) {
      return documents.filter(
        ({ document_manager_guid }, index) =>
          !document_manager_guids.includes(document_manager_guid, index + 1)
      );
    }
    return null;
  };

  const openSpatialDocumentModal = () => {
    dispatch(
      openModal({
        props: {
          title: "Upload Spatial Data",
          formName: FORM.ADD_MINE_MAJOR_APPLICATION,
          fieldName: "spatial_documents",
          uploadUrl: API.MAJOR_MINE_APPLICATION_DOCUMENTS(project?.project_guid),
          transformFile: (fileData: any) => ({
            ...fileData,
            major_mine_application_document_type_code:
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL,
          }),
        },
        content: AddSpatialDocumentsModal,
      })
    );
  };

  const documentColumns = [documentNameColumn(), uploadDateColumn()];
  const primaryDocumentsList = uniqueDocs(
    primaryDocuments,
    project?.major_mine_application?.documents,
    "PRM"
  );
  const spatialDocumentsList = uniqueDocs(
    spatialDocuments,
    project?.major_mine_application?.documents,
    "SPT"
  );
  const supportDocumentsList = uniqueDocs(
    supportingDocuments,
    project?.major_mine_application?.documents,
    "SPR"
  );

  return (
    <div>
      <FormWrapper name={FORM.ADD_MINE_MAJOR_APPLICATION} onSubmit={handleSubmit}>
        <Row>
          <Col span={24}>
            <Typography.Title level={4}>Basic Information</Typography.Title>
            <Typography.Paragraph>
              Please ensure the following information is correct and up to date. If changes are
              needed please edit your&nbsp;
              <Link
                to={routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
                  project?.project_guid,
                  project?.project_summary?.project_summary_guid
                )}
              >
                project description
              </Link>
              .
            </Typography.Paragraph>
          </Col>
        </Row>
        <Row>
          <Col span={12} style={{ marginRight: "40px" }}>
            <Typography.Title level={5}>Primary Contact</Typography.Title>
            <Field
              id="primary_contact"
              name="primary_contact"
              disabled
              component={renderConfig.FIELD}
            />
          </Col>
          <Col span={11}>
            <Typography.Title level={5}>Mine Name</Typography.Title>
            <Field id="mine_name" name="mine_name" disabled component={renderConfig.FIELD} />
          </Col>
        </Row>
        <Typography.Title level={4}>Application Files</Typography.Title>
        <Typography.Title level={5}>Upload primary application document</Typography.Title>
        <Typography.Paragraph>
          Please upload the main document for the submission. If your single document contains all
          supporting information you may not need to include separate supporting documentation.
        </Typography.Paragraph>
        <Field
          id={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY}
          name={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY}
          label="Upload primary application document"
          onFileLoad={(documentName: string, document_manager_guid: string) => {
            onFileLoad(
              documentName,
              document_manager_guid,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.PRIMARY,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY
            );
          }}
          onRemoveFile={(err: any, fileItem: any) => {
            onRemoveFile(
              err,
              fileItem,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY,
              primaryDocuments
            );
          }}
          projectGuid={project?.project_guid}
          labelIdle={
            '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
          }
          allowMultiple
          acceptedFileTypesMap={acceptedFileTypesMap}
          component={MajorMineApplicationFileUpload}
          uploadType="primary_document"
          validate={[required]}
        />
        {primaryDocumentsList?.length > 0 && (
          <DocumentTable
            documents={primaryDocumentsList}
            documentColumns={documentColumns}
            documentParent="Major Mine Application"
            canArchiveDocuments={true}
            onArchivedDocuments={() => refreshData()}
            enableBulkActions={true}
          />
        )}

        <br />
        <Typography.Title level={5}>Spatial Data Files</Typography.Title>
        <Typography.Paragraph>
          Please upload spatial files to support your application. You must upload at least one KML,
          KMZ, or Shapefile at a time. Visit{" "}
          <Link to={SPATIAL_DATA_STANDARDS_URL}>GIS Shapefile Standards</Link> to learn more about
          shapefile requirements and standards.
        </Typography.Paragraph>
        {isFeatureEnabled(Feature.SPATIAL_BUNDLE) ? (
          <>
            <Button
              type="primary"
              className="block-button"
              style={{ marginBottom: 12 }}
              onClick={openSpatialDocumentModal}
            >
              Upload Spatial Data
            </Button>
            {spatialDocumentsList?.length > 0 && (
              <SpatialDocumentTable
                documents={spatialDocumentsList}
                documentColumns={documentColumns}
                documentParent="Major Mine Application"
                onArchivedDocuments={refreshData}
              />
            )}
          </>
        ) : (
          <>
            <Field
              id={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL}
              name={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL}
              label="Upload spatial components"
              onFileLoad={(documentName, document_manager_guid) => {
                onFileLoad(
                  documentName,
                  document_manager_guid,
                  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL,
                  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL
                );
              }}
              onRemoveFile={(err: any, fileItem: any) => {
                onRemoveFile(
                  err,
                  fileItem,
                  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL,
                  spatialDocuments
                );
              }}
              projectGuid={project?.project_guid}
              labelIdle={
                '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
              }
              allowMultiple
              acceptedFileTypesMap={acceptedFileTypesMap}
              component={MajorMineApplicationFileUpload}
              uploadType="spatial_document"
            />
            {spatialDocuments?.length > 0 && (
              <DocumentTable
                documents={spatialDocuments}
                documentColumns={documentColumns}
                documentParent="Major Mine Application"
                canArchiveDocuments={true}
                onArchivedDocuments={refreshData}
                enableBulkActions={true}
              />
            )}
          </>
        )}

        <br />
        <Typography.Title level={5}>Supporting Documents</Typography.Title>
        <Typography.Paragraph>
          Additional documentation that supports your application can be uploaded here.
        </Typography.Paragraph>
        <Field
          id={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING}
          name={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING}
          label="Upload supporting documents"
          onFileLoad={(documentName: string, document_manager_guid: string) => {
            onFileLoad(
              documentName,
              document_manager_guid,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SUPPORTING,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING
            );
          }}
          onRemoveFile={(err: any, fileItem: any) => {
            onRemoveFile(
              err,
              fileItem,
              MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING,
              supportingDocuments
            );
          }}
          projectGuid={project?.project_guid}
          labelIdle={
            '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
          }
          allowMultiple
          acceptedFileTypesMap={acceptedFileTypesMap}
          component={MajorMineApplicationFileUpload}
          uploadType="supporting_document"
        />
        {supportDocumentsList?.length > 0 && (
          <DocumentTable
            documents={supportDocumentsList}
            documentColumns={documentColumns}
            documentParent="Major Mine Application"
            canArchiveDocuments={true}
            onArchivedDocuments={() => refreshData()}
            enableBulkActions={true}
          />
        )}

        <br />
        <ArchivedDocumentsSection
          mineGuid={project?.mine_guid}
          majorMineApplicationGuid={project?.major_mine_application?.major_mine_application_guid}
          refreshData={refreshData}
        />
        <br />
      </FormWrapper>
    </div>
  );
};

export default MajorMineApplicationForm;
