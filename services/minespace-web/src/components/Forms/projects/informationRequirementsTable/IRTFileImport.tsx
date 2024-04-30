import React, { FC, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { change, Field, formValueSelector } from "redux-form";
import { Alert, Col, Form, Row, Typography } from "antd";
import { remove } from "lodash";
import { ENVIRONMENT, IFileInfo, IProject } from "@mds/common";
import * as API from "@mds/common/constants/API";
import {
  createInformationRequirementsTable,
  updateInformationRequirementsTableByFile,
} from "@mds/common/redux/actionCreators/projectActionCreator";
import { getProject } from "@mds/common/redux/selectors/projectSelectors";
import { MODERN_EXCEL } from "@mds/common/constants/fileTypes";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/LinkButton";
import DocumentTable from "@/components/common/DocumentTable";
import IRTFileUpload from "@/components/Forms/projects/informationRequirementsTable/IRTFileUpload";
import {
  renderCategoryColumn,
  renderDateColumn,
  renderTextColumn,
} from "@mds/common/components/common/CoreTableCommonColumns";
import { formatDateTime } from "@common/utils/helpers";
import { documentNameColumn } from "@/components/common/DocumentColumns";
import { MineDocument } from "@mds/common/models/documents/document";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

interface IRTFileImportProps {
  projectGuid: string;
  informationRequirementsTableDocumentTypesHash: any;
  importIsSuccessful: (success: boolean, err: string) => void;
  downloadIRTTemplate: (url: string) => void;
}

export const IRTFileImport: FC<IRTFileImportProps> = ({
  projectGuid,
  importIsSuccessful,
  downloadIRTTemplate,
  informationRequirementsTableDocumentTypesHash,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const formSelector = formValueSelector(FORM.INFORMATION_REQUIREMENTS_TABLE);
  const dispatch = useDispatch();

  const project: IProject = useSelector(getProject);

  const documents = useSelector((state) => formSelector(state, "documents"));

  const acceptedFileTypesMap = {
    ...MODERN_EXCEL,
  };

  const onFileLoad = (fileName, document_manager_guid) => {
    setUploadedFiles([...uploadedFiles, { document_name: fileName, document_manager_guid }]);
    return dispatch(change(FORM.INFORMATION_REQUIREMENTS_TABLE, "final_irt", uploadedFiles));
  };

  const onRemoveFile = (err, fileItem) => {
    remove(documents, { document_manager_guid: fileItem.serverId });
    return dispatch(change(FORM.INFORMATION_REQUIREMENTS_TABLE, "final_irt", documents));
  };

  const acceptFileTypeArray = Object.keys(acceptedFileTypesMap);
  const tableDocuments =
    project?.information_requirements_table?.documents?.map(
      (doc) =>
        new MineDocument({
          ...doc,
          category: doc.information_requirements_table_document_type_code,
        })
    ) || [];
  const documentColumns = [
    documentNameColumn(),
    renderCategoryColumn("category", "Category", informationRequirementsTableDocumentTypesHash),
    renderDateColumn("upload_date", "Date/Time", true, formatDateTime),
    renderTextColumn("create_user", "Imported By"),
  ];

  const handleCreateInformationRequirementsTable = async (
    projectGuid: string,
    file: IFileInfo,
    documentGuid: string
  ) => {
    return dispatch(createInformationRequirementsTable(projectGuid, file, documentGuid));
  };

  const handleUpdateInformationRequirementsTableByFile = async (
    projectGuid: string,
    informationRequirementsTableGuid: string,
    file: IFileInfo,
    documentGuid: string
  ) => {
    return dispatch(
      updateInformationRequirementsTableByFile(
        projectGuid,
        informationRequirementsTableGuid,
        file,
        documentGuid
      )
    );
  };

  return (
    <FormWrapper name={FORM.INFORMATION_REQUIREMENTS_TABLE} onSubmit={() => {}}>
      <Row>
        <Col span={24}>
          <Typography.Title level={4}>Import IRT file</Typography.Title>
          <Typography.Paragraph>
            Please upload your final IRT file.
            <ul>
              <li>You cannot upload ZIP files</li>
              <li>The allowed file types are: {acceptFileTypeArray.join(", ")}</li>
              <li>Maximum individual file size is 400 MB</li>
              <li>You can only upload one file at a time</li>
            </ul>
          </Typography.Paragraph>
          <Typography.Paragraph>
            Download{" "}
            <LinkButton
              onClick={() => {
                downloadIRTTemplate(
                  ENVIRONMENT.apiUrl + API.INFORMATION_REQUIREMENTS_TABLE_TEMPLATE_DOWNLOAD
                );
              }}
            >
              IRT template
            </LinkButton>{" "}
            here.
          </Typography.Paragraph>
          <Form.Item wrapperCol={{ lg: 24 }} style={{ width: "100%", marginRight: 0 }}>
            <DocumentTable
              documents={tableDocuments}
              documentParent="Information Requirements Table"
              documentColumns={documentColumns}
              isViewOnly
            />
            <br />
            {project?.information_requirements_table?.status_code === "SUB" && (
              <Alert
                message="Re-uploading a new file will replace all the data imported from the current final IRT."
                description=""
                type="info"
                showIcon
              />
            )}
            <br />
            <Field
              id="final_irt"
              name="final_irt"
              onFileLoad={onFileLoad}
              onRemoveFile={onRemoveFile}
              createInformationRequirementsTable={handleCreateInformationRequirementsTable}
              updateInformationRequirementsTableByFile={
                handleUpdateInformationRequirementsTableByFile
              }
              irtGuid={project?.information_requirements_table?.irt_guid}
              projectGuid={projectGuid}
              acceptedFileTypesMap={acceptedFileTypesMap}
              importIsSuccessful={importIsSuccessful}
              component={IRTFileUpload}
            />
          </Form.Item>
        </Col>
      </Row>
    </FormWrapper>
  );
};

export default IRTFileImport;
