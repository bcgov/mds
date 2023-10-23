import React, { FC, useState } from "react";
import PropTypes from "prop-types";
import { change, Field, formValueSelector } from "redux-form";
// import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Col, Form, Row, Typography } from "antd";
import { bindActionCreators } from "redux";
import { DOCUMENT, EXCEL, IMAGE } from "@common/constants/fileTypes";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import { documentNameColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import ProjectSummaryFileUpload from "@/components/Forms/projects/projectSummary/ProjectSummaryFileUpload";
import * as FORM from "@/constants/forms";
import { renderCategoryColumn } from "@/components/common/CoreTableCommonColumns";
import { MineDocument } from "@mds/common/models/documents/document";
import { IMineDocument } from "@mds/common";
import { RootState } from "@/App";
import { postNewDocumentVersion } from "@common/actionCreators/documentActionCreator";
import { ActionCreator } from "@/interfaces/actionCreator";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  change: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineGuid: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
    }),
  }).isRequired,
};

interface IProjectSummaryDocument extends IMineDocument {
  project_summary_document_type_code: string;
}

export interface ProjectSummary {
  project_summary_id: number;
  mine_guid: string;
  project_summary_guid: string;
  status_code: string;
  submission_date: string;
  project_summary_description: string;
  project_guid: string;
  documents: IProjectSummaryDocument[];
}

interface DocumentUploadProps {
  initialValues: ProjectSummary;
  change: any;
  documents: IProjectSummaryDocument[];
  isEditMode: boolean;
  projectSummaryDocumentTypesHash: any;
  mineGuid: string;
  postNewDocumentVersion: ActionCreator<typeof postNewDocumentVersion>;
}

export const DocumentUpload: FC<DocumentUploadProps> = (props) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const { initialValues, documents, isEditMode, projectSummaryDocumentTypesHash, mineGuid } = props;

  const acceptedFileTypesMap = {
    ...DOCUMENT,
    ...EXCEL,
    ...IMAGE,
  };

  const onFileLoad = (
    fileName: string,
    document_manager_guid: string,
    version?: { document_manager_version_guid: string; document_manager_guid: string }
  ) => {
    if (version.document_manager_version_guid) {
      const ConnectedVersion = props.postNewDocumentVersion({
        mineGuid: initialValues.mine_guid,
        mineDocumentGuid: version.document_manager_guid,
        documentManagerVersionGuid: version.document_manager_version_guid,
      });

      // Save the new version to the document that matches the document_manager_guid
      const newUploadedFiles = documents.map((doc) => {
        if (doc.document_manager_guid === version.document_manager_guid) {
          return {
            ...doc,
            versions: [...doc.versions, ConnectedVersion],
          };
        }

        return doc;
      });
      return props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", newUploadedFiles);
    } else {
      const newUploadedFiles = [
        ...uploadedFiles,
        { document_name: fileName, document_manager_guid },
      ];
      setUploadedFiles(newUploadedFiles);
      return props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", newUploadedFiles);
    }
  };

  const onRemoveFile = (err, fileItem) => {
    remove(documents, { document_manager_guid: fileItem.serverId });
    return props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", documents);
  };

  const acceptFileTypeArray = Object.keys(acceptedFileTypesMap);
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
    renderCategoryColumn(
      "project_summary_document_type_code",
      "Category",
      projectSummaryDocumentTypesHash
    ),
    uploadDateColumn(),
  ];
  return (
    <>
      <Typography.Title level={3}>Document Upload</Typography.Title>
      <Form.Item label="Attach your project description file(s) here.">
        <Row gutter={16}>
          <Col span={12}>
            <Typography.Paragraph>
              <ul>
                <li>You cannot upload ZIP files</li>
                <li>The allowed file types are: {acceptFileTypeArray.join(", ")}</li>
                <li>Maximum individual file size is 400 MB</li>
              </ul>
            </Typography.Paragraph>
          </Col>
        </Row>
        {isEditMode && (
          <DocumentTable
            documents={tableDocuments}
            documentParent="project summary"
            documentColumns={documentColumns}
          />
        )}

        <Field
          id="documents"
          name="documents"
          onFileLoad={onFileLoad}
          onRemoveFile={onRemoveFile}
          params={fileUploadParams}
          acceptedFileTypesMap={acceptedFileTypesMap}
          component={ProjectSummaryFileUpload}
          props={{ documents: documents }}
        />
      </Form.Item>
    </>
  );
};

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state: RootState) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      postNewDocumentVersion,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(DocumentUpload);
