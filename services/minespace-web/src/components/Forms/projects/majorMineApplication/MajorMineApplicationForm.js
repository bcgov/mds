import React, { Component } from "react";
import PropTypes from "prop-types";
import customPropTypes from "@/customPropTypes";
import { bindActionCreators, compose } from "redux";
import { connect } from "react-redux";
import { Field, reduxForm, change, getFormValues, formValueSelector } from "redux-form";
import { remove } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Popconfirm, Typography } from "antd";
import { required, maxLength } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import DocumentTable from "@/components/common/DocumentTable";
import { DOCUMENT, MODERN_EXCEL, UNIQUELY_SPATIAL } from "@/constants/fileTypes";
import {
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE,
  MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE,
} from "@common/constants/strings";
import MajorMineApplicationFileUpload from "@/components/Forms/projects/majorMineApplication/MajorMineApplicationFileUpload";
import { getProject } from "@common/selectors/projectSelectors";

const propTypes = {
  project: customPropTypes.project.isRequired,
  projectGuid: PropTypes.string.isRequired,
  primary: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  spatial: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  supporting: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  change: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.object),
  formValues: PropTypes.objectOf(PropTypes.any),
  handleSaveData: PropTypes.func.isRequired,
  majorMinesApplicationDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const defaultProps = {
  documents: [],
  formValues: {},
};

export class MajorMineApplicationForm extends Component {
  state = {
    uploadedFiles: [],
    primaryFile: false,
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
      major_mine_application_document_type: documentTypeCode,
    });

    if (documentTypeCode === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.PRIMARY) {
      this.setState({ primaryFile: true });
    }

    return this.props.change(
      documentTypeField,
      this.state.uploadedFiles.filter(
        (file) => file?.major_mine_application_document_type === documentTypeCode
      )
    );
  };

  onRemoveFile = (err, fileItem, documentTypeFieldForm, documentsForm) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    remove(documentsForm, { document_manager_guid: fileItem.serverId });
    if (
      documentTypeFieldForm === MAJOR_MINES_APPLICATION_DOCUMENT_TYPE_CODE.PRIMARY &&
      documentsForm?.length === 0
    ) {
      this.setState({ primaryFile: false });
    }
    return this.props.change(documentTypeFieldForm, documentsForm);
  };

  filterDocs = (docs, applicationDocumentTypeCode) =>
    (docs || []).filter(
      (doc) => doc?.major_mine_application_document_type_code === applicationDocumentTypeCode
    );

  render() {
    return (
      <div>
        <Form layout="vertical">
          <Typography.Title level={4}>Application Files</Typography.Title>
          <Typography.Title level={5}>Submission project title</Typography.Title>
          <Field
            id="submission_project_title"
            name="submission_project_title"
            component={renderConfig.FIELD}
            validate={[maxLength(300), required]}
          />
          <br />
          <Typography.Title level={5}>Upload primary application document</Typography.Title>
          <Typography.Text>
            Please upload the main document for the submission. If your single document contains all
            supporting information you may not need to include separate supporting documentation.
          </Typography.Text>
          {this.props.project?.major_mine_application?.status_code === null ? (
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
                  this.props.primary
                );
              }}
              projectGuid={this.props.projectGuid}
              maxFiles={1}
              labelIdle={
                '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
              }
              allowMultiple
              acceptedFileTypesMap={this.acceptedFileTypesMap}
              component={MajorMineApplicationFileUpload}
              validate={[required]}
            />
          ) : (
            <DocumentTable
              documents={this.filterDocs(
                this.props.project?.major_mine_application?.documents,
                "PRM"
              )}
              documentCategoryOptionsHash={this.props.majorMinesApplicationDocumentTypesHash}
              documentParent="Primary application document"
              categoryDataIndex="major_mine_application_document_type_code"
              uploadDateIndex="upload_date"
            />
          )}
          <br />
          <Typography.Title level={5}>Upload spatial documents</Typography.Title>
          <Typography.Text>
            Please upload spatial files to support your application. You must upload at least one
            spatial file to support your application.
          </Typography.Text>
          {this.props.project?.major_mine_application?.status_code === null ? (
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
                  this.props.spatial
                );
              }}
              projectGuid={this.props.projectGuid}
              maxFiles={null}
              labelIdle={
                '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
              }
              allowMultiple
              acceptedFileTypesMap={this.acceptedFileTypesMap}
              component={MajorMineApplicationFileUpload}
            />
          ) : (
            <DocumentTable
              documents={this.filterDocs(
                this.props.project?.major_mine_application?.documents,
                "SPT"
              )}
              documentCategoryOptionsHash={this.props.majorMinesApplicationDocumentTypesHash}
              documentParent="Spatial application documents"
              categoryDataIndex="major_mine_application_document_type_code"
              uploadDateIndex="upload_date"
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
          {this.props.project?.major_mine_application?.status_code === null ? (
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
                  this.props.supporting
                );
              }}
              projectGuid={this.props.projectGuid}
              maxFiles={null}
              labelIdle={
                '<strong>Drag & Drop your files or <span class="filepond--label-action">Browse</span></strong><div>(Accepted filetypes: .kmx .doc .docx .xlsx .pdf)</div>'
              }
              acceptedFileTypesMap={this.acceptedFileTypesMap}
              allowMultiple
              component={MajorMineApplicationFileUpload}
            />
          ) : (
            <DocumentTable
              documents={this.filterDocs(
                this.props.project?.major_mine_application?.documents,
                "SPR"
              )}
              documentCategoryOptionsHash={this.props.majorMinesApplicationDocumentTypesHash}
              documentParent="Supporting application document"
              categoryDataIndex="major_mine_application_document_type_code"
              uploadDateIndex="upload_date"
            />
          )}
          <Col span={6}>
            <div>
              <Popconfirm
                placement="topRight"
                title="Are you sure you want to submit your major mine application to the Province of British Columbia?"
                onConfirm={(e) =>
                  this.props.handleSaveData(
                    e,
                    {
                      ...this.props.formValues,
                      documents: [
                        ...(this.props.formValues?.primary || []),
                        ...(this.props.formValues?.spatial || []),
                        ...(this.props.formValues?.supporting || []),
                      ],
                      status_code: "REC",
                    },
                    "Successfully submitted a major mine application to the Province of British Columbia."
                  )
                }
                okText="Yes"
                cancelText="No"
              >
                <Button
                  type="primary"
                  disabled={
                    this.props.project?.major_mine_application?.status_code ||
                    !this.state.primaryFile
                  }
                >
                  Submit
                </Button>
              </Popconfirm>
            </div>
          </Col>
        </Form>
      </div>
    );
  }
}

MajorMineApplicationForm.propTypes = propTypes;
MajorMineApplicationForm.defaultProps = defaultProps;

const selector = formValueSelector(FORM.ADD_MINE_MAJOR_APPLICATION);
const mapStateToProps = (state) => ({
  formValues: getFormValues(FORM.ADD_MINE_MAJOR_APPLICATION)(state) || {},
  project: getProject(state),
  primary: selector(state, "primary"),
  spatial: selector(state, "spatial"),
  supporting: selector(state, "supporting"),
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
    touchOnBlur: true,
    touchOnChange: false,
    enableReinitialize: true,
    onSubmit: resetForm(FORM.ADD_MINE_MAJOR_APPLICATION),
  })
)(MajorMineApplicationForm);
