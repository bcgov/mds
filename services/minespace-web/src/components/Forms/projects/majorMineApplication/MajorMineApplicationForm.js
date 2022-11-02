import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, change, formValueSelector } from "redux-form";
import { remove } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row, Typography } from "antd";
import { required } from "@common/utils/Validate";
import {
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE,
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE,
} from "@common/constants/strings";
import { resetForm } from "@common/utils/helpers";
import { DOCUMENT, MODERN_EXCEL, UNIQUELY_SPATIAL } from "@common/constants/fileTypes";
import * as routes from "@/constants/routes";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { uploadDateColumn } from "@/components/common/DocumentColumns";
import DocumentTable from "@/components/common/DocumentTable";
import customPropTypes from "@/customPropTypes";
import MajorMineApplicationFileUpload from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";

const propTypes = {
  project: customPropTypes.project.isRequired,
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  primary_documents: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ),
  spatial_documents: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ),
  supporting_documents: PropTypes.arrayOf(
    PropTypes.objectOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ),
};

const defaultProps = {
  primary_documents: [],
  spatial_documents: [],
  supporting_documents: [],
};

export class MajorMineApplicationForm extends Component {
  state = {
    uploadedFiles: [],
  };

  acceptedFileTypesMap = {
    ...UNIQUELY_SPATIAL,
    ...DOCUMENT,
    ...MODERN_EXCEL,
  };

  onFileLoad = (fileName, document_manager_guid, documentTypeCode, documentTypeField) => {
    this.state.uploadedFiles.push({
      document_name: fileName,
      document_manager_guid,
      major_mine_application_document_type_code: documentTypeCode,
    });
    return this.props.change(
      documentTypeField,
      this.state.uploadedFiles.filter(
        (file) => file?.major_mine_application_document_type_code === documentTypeCode
      )
    );
  };

  onRemoveFile = (err, fileItem, documentTypeFieldForm, documentsForm) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    remove(documentsForm, { document_manager_guid: fileItem.serverId });

    return this.props.change(documentTypeFieldForm, documentsForm);
  };

  filterDocs = (docs, applicationDocumentTypeCode) =>
    (docs || []).filter(
      (doc) => doc?.major_mine_application_document_type_code === applicationDocumentTypeCode
    );

  uniqueDocs = (formDocuments, mmaDocuments, type_code) => {
    const documents = [
      ...formDocuments,
      ...(mmaDocuments
        ? mmaDocuments?.filter((doc) => doc.major_mine_application_document_type_code === type_code)
        : []),
    ];
    const document_manager_guids = documents.map((o) => o.document_manager_guid);

    if (documents.length > 0) {
      return documents?.filter(
        ({ document_manager_guid }, index) =>
          !document_manager_guids.includes(document_manager_guid, index + 1)
      );
    }
    return null;
  };

  render() {
    const documentColumns = [uploadDateColumn("upload_date")];
    const primaryDocuments = this.uniqueDocs(
      this.props.primary_documents,
      this.props.project?.major_mine_application?.documents,
      "PRM"
    );
    const spatialDocuments = this.uniqueDocs(
      this.props.spatial_documents,
      this.props.project?.major_mine_application?.documents,
      "SPT"
    );
    const supportDocuments = this.uniqueDocs(
      this.props.supporting_documents,
      this.props.project?.major_mine_application?.documents,
      "SPR"
    );
    return (
      <div>
        <Form layout="vertical" onSubmit={this.props.handleSubmit}>
          <Row>
            <Col span={24}>
              <Typography.Title level={4}>Basic Information</Typography.Title>
              <Typography.Paragraph>
                Please ensure the following information is correct and up to date. If changes are
                needed please edit your&nbsp;
                <Link
                  to={routes.EDIT_PROJECT_SUMMARY.dynamicRoute(
                    this.props.project?.project_guid,
                    this.props.project?.project_summary?.project_summary_guid
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
            onFileLoad={(documentName, document_manager_guid) => {
              this.onFileLoad(
                documentName,
                document_manager_guid,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.PRIMARY,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY
              );
            }}
            onRemoveFile={(err, fileItem) => {
              this.onRemoveFile(
                err,
                fileItem,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.PRIMARY,
                this.props.primary_documents
              );
            }}
            projectGuid={this.props.project?.project_guid}
            labelIdle={
              '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
            }
            allowMultiple
            acceptedFileTypesMap={this.acceptedFileTypesMap}
            component={MajorMineApplicationFileUpload}
            uploadType="primary_document"
            validate={[required]}
          />
          {primaryDocuments?.length > 0 && (
            <DocumentTable
              documents={primaryDocuments}
              documentColumns={documentColumns}
              documentParent="Major Mine Application"
            />
          )}

          <br />
          <Typography.Title level={5}>Upload spatial documents</Typography.Title>
          <Typography.Text>
            Please upload spatial files to support your application. You must upload at least one
            spatial file to support your application.
          </Typography.Text>

          <Field
            id={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL}
            name={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL}
            label="Upload spatial components"
            onFileLoad={(documentName, document_manager_guid) => {
              this.onFileLoad(
                documentName,
                document_manager_guid,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SPATIAL,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL
              );
            }}
            onRemoveFile={(err, fileItem) => {
              this.onRemoveFile(
                err,
                fileItem,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SPATIAL,
                this.props.spatial_documents
              );
            }}
            projectGuid={this.props.project?.project_guid}
            labelIdle={
              '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
            }
            allowMultiple
            acceptedFileTypesMap={this.acceptedFileTypesMap}
            component={MajorMineApplicationFileUpload}
            uploadType="spatial_document"
          />
          {spatialDocuments?.length > 0 && (
            <DocumentTable
              documents={spatialDocuments}
              documentColumns={documentColumns}
              documentParent="Major Mine Application"
            />
          )}
          <br />
          <Typography.Title level={5}>Upload supporting application documents</Typography.Title>
          <Typography.Text>
            Upload additional files that support your primary document submission. You can include
            many types of files such as:
          </Typography.Text>
          <ul>
            <li>Application</li>
            <li>Mapping</li>
            <li>Procedures and Plans</li>
            <li>Site Studies and Assessments</li>
            <li>Plans and Transfers</li>
            <li>Site Studies and Assessments</li>
          </ul>

          <Field
            id={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING}
            name={MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING}
            label="Upload supporting application documents"
            onFileLoad={(documentName, document_manager_guid) => {
              this.onFileLoad(
                documentName,
                document_manager_guid,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.SUPPORTING,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING
              );
            }}
            onRemoveFile={(err, fileItem) => {
              this.onRemoveFile(
                err,
                fileItem,
                MAJOR_MINES_APPLICATION_DOCUMENT_TYPE.SUPPORTING,
                this.props.supporting_documents
              );
            }}
            projectGuid={this.props.project?.project_guid}
            labelIdle={
              '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
            }
            acceptedFileTypesMap={this.acceptedFileTypesMap}
            allowMultiple
            component={MajorMineApplicationFileUpload}
            uploadType="supporting_document"
          />
          {supportDocuments?.length > 0 && (
            <DocumentTable
              documents={supportDocuments}
              documentParent="Major Mine Application"
              documentColumns={documentColumns}
            />
          )}
        </Form>
      </div>
    );
  }
}

MajorMineApplicationForm.propTypes = propTypes;
MajorMineApplicationForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_MINE_MAJOR_APPLICATION);
const mapStateToProps = (state) => ({
  primary_documents: selector(state, "primary_documents"),
  spatial_documents: selector(state, "spatial_documents"),
  supporting_documents: selector(state, "supporting_documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_MINE_MAJOR_APPLICATION,
    destroyOnUnmount: false,
    forceUnregisterOnUnmount: true,
    touchOnBlur: true,
    enableReinitialize: true,
    onSubmitSuccess: resetForm(FORM.ADD_MINE_MAJOR_APPLICATION),
    onSubmit: () => {},
  })
)(MajorMineApplicationForm);
