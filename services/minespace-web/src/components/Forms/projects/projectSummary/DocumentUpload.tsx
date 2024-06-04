import React, { FC, useEffect } from "react";
import { change, Field, getFormValues } from "redux-form";
import { connect, useSelector } from "react-redux";
import { Form, Typography } from "antd";
import { bindActionCreators } from "redux";
import { CSV, DOCUMENT, EXCEL, IMAGE, OTHER_SPATIAL, XML } from "@mds/common/constants/fileTypes";
import DocumentTable from "@/components/common/DocumentTable";
import {
  documentNameColumn,
  uploadDateColumn,
  uploadedByColumn,
} from "@/components/common/DocumentColumns";
import ProjectSummaryFileUpload from "@/components/Forms/projects/projectSummary/ProjectSummaryFileUpload";
import * as FORM from "@/constants/forms";
import { renderCategoryColumn } from "@mds/common/components/common/CoreTableCommonColumns";
import { MineDocument } from "@mds/common/models/documents/document";
import {
  IMineDocument,
  IProjectSummary,
  IProjectSummaryDocument,
  ENVIRONMENT,
  PROJECT_SUMMARY_DOCUMENT_TYPE_CODE,
} from "@mds/common";
import { postNewDocumentVersion } from "@mds/common/redux/actionCreators/documentActionCreator";
import { ActionCreator } from "@mds/common/interfaces/actionCreator";
import LinkButton from "@/components/common/LinkButton";
import * as API from "@mds/common/constants/API";

// interface IProjectSummaryDocument extends IMineDocument {
//   project_summary_document_type_code: string;
// }

// export interface ProjectSummary {
//   project_summary_id: number;
//   mine_guid: string;
//   project_summary_guid: string;
//   status_code: string;
//   submission_date: string;
//   project_summary_description: string;
//   project_guid: string;
//   documents: IProjectSummaryDocument[];
// }

interface DocumentUploadProps {
  initialValues: Partial<IProjectSummary>;
  // change: any;
  documents: Partial<IProjectSummaryDocument>[];
  isEditMode: boolean;
  projectSummaryDocumentTypesHash: any;
  mineGuid: string;
  // postNewDocumentVersion: ActionCreator<typeof postNewDocumentVersion>;
}

export const DocumentUpload: FC<DocumentUploadProps> = (props) => {
  const { initialValues, documents, isEditMode, projectSummaryDocumentTypesHash, mineGuid } = props;
  const { spatial_documents = [], support_documents = [] } = useSelector(
    getFormValues(FORM.ADD_EDIT_PROJECT_SUMMARY)
  );
  const spatialAcceptedFileTypesMap = {
    ...OTHER_SPATIAL,
    ...XML,
  };

  const supportingAcceptedFileTypesMap = {
    ...DOCUMENT,
    ...EXCEL,
    ...CSV,
    ...IMAGE,
  };

  useEffect(() => {
    change(FORM.ADD_EDIT_PROJECT_SUMMARY, "spatial_documents", []);
    change(FORM.ADD_EDIT_PROJECT_SUMMARY, "support_documents", []);
  }, []);

  useEffect(() => {
    change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", [
      ...spatial_documents,
      ...support_documents,
    ]);
  }, [spatial_documents.length, support_documents.length]);

  const onFileLoad = (
    fileName: string,
    project_summary_document_type_code: string,
    document_manager_guid: string,
    version?: { document_manager_version_guid: string; document_manager_guid: string }
  ) => {
    let newUploadedFiles = [];
    if (version.document_manager_version_guid) {
      const ConnectedVersion = postNewDocumentVersion({
        mineGuid: initialValues.mine_guid,
        mineDocumentGuid: version.document_manager_guid,
        documentManagerVersionGuid: version.document_manager_version_guid,
      });

      // Save the new version to the document that matches the document_manager_guid
      newUploadedFiles = documents.map((doc) => {
        if (doc.document_manager_guid === version.document_manager_guid) {
          return {
            ...doc,
            versions: [...doc.versions, ConnectedVersion],
          };
        }

        return doc;
      });
    } else {
      const uploadedFiles =
        project_summary_document_type_code === PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SPATIAL
          ? spatial_documents
          : support_documents;
      newUploadedFiles = [
        ...uploadedFiles,
        { document_name: fileName, document_manager_guid, project_summary_document_type_code },
      ];
    }

    if (project_summary_document_type_code === PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SPATIAL) {
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "spatial_documents", newUploadedFiles);
    } else {
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "support_documents", newUploadedFiles);
    }
  };

  const onRemoveFile = (err, fileItem) => {
    const document_type_code = documents.find(
      (file) => fileItem.serverId === file.document_manager_guid
    )?.project_summary_document_type_code;
    if (document_type_code === PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SPATIAL) {
      const newSpatialDocuments = [...spatial_documents].filter(
        (file) => fileItem.serverId !== file.document_manager_guid
      );
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "spatial_documents", newSpatialDocuments);
    } else if (document_type_code === PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SUPPORTING) {
      const newSupportDocuments = [...support_documents].filter(
        (file) => fileItem.serverId !== file.document_manager_guid
      );
      change(FORM.ADD_EDIT_PROJECT_SUMMARY, "support_documents", newSupportDocuments);
    }
  };

  const downloadIRTTemplate = (url) => {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.style.display = "none";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  };

  const fileUploadParams = {
    mineGuid: initialValues.mine_guid,
    projectGuid: initialValues.project_guid,
    projectSummaryGuid: initialValues.project_summary_guid,
  };

  const tableDocuments =
    initialValues?.documents?.map(
      (doc) => new MineDocument({ ...doc, category: doc.project_summary_document_type_code })
    ) ?? [];

  const documentColumns = [
    documentNameColumn(),
    renderCategoryColumn("category", "Document Category", projectSummaryDocumentTypesHash),
    uploadDateColumn("upload_date", "Updated"),
    uploadedByColumn("create_user", "Updated By"),
  ];
  return (
    <>
      <Typography.Title level={3}>Document Upload</Typography.Title>
      <Form.Item label="Upload supporting files that are not part of the required documents in Purpose and Authorization.">
        <Typography.Title level={5}>Spatial Documents</Typography.Title>
        <Typography.Paragraph>
          Upload spatial files to support the application. You may only upload specified spatial
          types.
        </Typography.Paragraph>

        <Field
          id="spatial_documents"
          name="spatial_documents"
          onFileLoad={(document_name, document_manager_guid, version) =>
            onFileLoad(
              document_name,
              PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SPATIAL,
              document_manager_guid,
              version
            )
          }
          onRemoveFile={onRemoveFile}
          params={fileUploadParams}
          acceptedFileTypesMap={spatialAcceptedFileTypesMap}
          component={ProjectSummaryFileUpload}
          props={{
            documents: documents,
            label: "Upload spatial documents",
            labelIdle:
              '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>' +
              "<div>We accept spatial files with max individual file size of 400 MB.</div>",
          }}
        />

        <Typography.Title level={5}>Supporting Documents</Typography.Title>
        <Typography.Paragraph>
          Upload any supporting document and draft of{" "}
          <LinkButton
            onClick={() =>
              downloadIRTTemplate(
                ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
              )
            }
          >
            Information Requirements Table (IRT)
          </LinkButton>{" "}
          following the official template here. It is required to upload your final IRT in the form
          provided to proceed to the final application.
        </Typography.Paragraph>
        <Field
          id="support_documents"
          name="support_documents"
          onFileLoad={(document_name, document_manager_guid, version) =>
            onFileLoad(
              document_name,
              PROJECT_SUMMARY_DOCUMENT_TYPE_CODE.SUPPORTING,
              document_manager_guid,
              version
            )
          }
          onRemoveFile={onRemoveFile}
          params={fileUploadParams}
          acceptedFileTypesMap={supportingAcceptedFileTypesMap}
          component={ProjectSummaryFileUpload}
          props={{
            documents: documents,
            label: "Upload Files",
            labelIdle:
              '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><br>' +
              "<div>We accept most common document, image, and spreadsheet with max individual file size of 400 MB.</div>",
          }}
        />

        {isEditMode && (
          <DocumentTable
            documents={tableDocuments}
            documentParent="project summary"
            documentColumns={documentColumns}
          />
        )}
      </Form.Item>
    </>
  );
};

// const mapDispatchToProps = (dispatch) =>
//   bindActionCreators(
//     {
//       change,
//       postNewDocumentVersion,
//     },
//     dispatch
//   );

// export default connect(null, mapDispatchToProps)(DocumentUpload);
export default DocumentUpload;
