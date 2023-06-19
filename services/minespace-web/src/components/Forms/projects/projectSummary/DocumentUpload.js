import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change, formValueSelector } from "redux-form";
import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Typography, Row, Col } from "antd";
import { bindActionCreators } from "redux";
import { DOCUMENT, EXCEL, IMAGE } from "@common/constants/fileTypes";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import { categoryColumn, uploadDateColumn } from "@/components/common/DocumentColumns";
import ProjectSummaryFileUpload from "@/components/Forms/projects/projectSummary/ProjectSummaryFileUpload";
import * as FORM from "@/constants/forms";

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

export class DocumentUpload extends Component {
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
    return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.props.documents);
  };

  render() {
    const acceptFileTypeArray = Object.keys(this.acceptedFileTypesMap);
    const fileUploadParams = {
      mineGuid: this.props.initialValues.mine_guid,
      projectGuid: this.props.initialValues.project_guid,
      projectSummaryGuid: this.props.initialValues.project_summary_guid,
    };
    const documentColumns = [
      categoryColumn(
        "project_summary_document_type_code",
        this.props.projectSummaryDocumentTypesHash
      ),
      uploadDateColumn("upload_date"),
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
          {this.props.isEditMode && (
            <DocumentTable
              documents={this.props.initialValues?.documents}
              documentParent="project summary"
              documentColumns={documentColumns}
            />
          )}

          <Field
            id="documents"
            name="documents"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            params={fileUploadParams}
            acceptedFileTypesMap={this.acceptedFileTypesMap}
            component={ProjectSummaryFileUpload}
          />
        </Form.Item>
      </>
    );
  }
}

DocumentUpload.propTypes = propTypes;
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

export default connect(mapStateToProps, mapDispatchToProps)(DocumentUpload);
