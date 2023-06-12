import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Typography, Row, Col } from "antd";
import { bindActionCreators } from "redux";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import { ProjectSummaryFileUpload } from "@/components/Forms/projectSummaries/ProjectSummaryFileUpload";
import * as FORM from "@/constants/forms";
import { DOCUMENT, EXCEL, IMAGE } from "@/constants/fileTypes";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary.isRequired,
  change: PropTypes.func.isRequired,
  removeDocument: PropTypes.func.isRequired,
  archiveDocuments: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  canRemoveDocuments: PropTypes.bool.isRequired,
  canArchiveDocuments: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  mineGuid: PropTypes.string.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      mineGuid: PropTypes.string,
    }),
  }).isRequired,
  isNewProject: PropTypes.bool,
  isEditMode: PropTypes.bool,
};

const defaultProps = {
  isEditMode: false,
  isNewProject: false,
};

export class ProjectSummaryDocumentUpload extends Component {
  state = {
    uploadedFiles: [],
  };

  acceptedFileTypesMap = {
    ...DOCUMENT,
    ...EXCEL,
    ...IMAGE,
  };

  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ document_name: fileName, document_manager_guid });
    return this.props.change("documents", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change("documents", this.props.documents);
  };

  render() {
    const acceptFileTypeArray = Object.keys(this.acceptedFileTypesMap);
    const fileUploadParams = {
      mineGuid: this.props.mineGuid,
      projectGuid: this.props.initialValues?.project_guid,
      projectSummaryGuid: this.props.initialValues?.project_summary_guid,
    };

    return (
      <>
        <Typography.Title level={4}>Documents</Typography.Title>
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

          <DocumentTable
            documents={this.props.initialValues?.documents?.reduce(
              (docs, doc) => [
                {
                  key: doc.mine_document_guid,
                  mine_document_guid: doc.mine_document_guid,
                  document_manager_guid: doc.document_manager_guid,
                  name: doc.document_name,
                  category: this.props.projectSummaryDocumentTypesHash[
                    doc.project_summary_document_type_code
                  ],
                  uploaded: doc.upload_date,
                },
                ...docs,
              ],
              []
            )}
            removeDocument={this.props.canRemoveDocuments ? this.props.removeDocument : null}
            archiveDocuments={this.props.canArchiveDocuments ? this.props.archiveDocuments : null}
            isViewOnly={!(this.props.isEditMode || this.props.isNewProject)}
          />
          {(this.props.isEditMode || this.props.isNewProject) && (
            <Field
              id="documents"
              name="documents"
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
              params={fileUploadParams}
              acceptedFileTypesMap={this.acceptedFileTypesMap}
              component={ProjectSummaryFileUpload}
            />
          )}
        </Form.Item>
      </>
    );
  }
}

ProjectSummaryDocumentUpload.propTypes = propTypes;
ProjectSummaryDocumentUpload.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(ProjectSummaryDocumentUpload);
