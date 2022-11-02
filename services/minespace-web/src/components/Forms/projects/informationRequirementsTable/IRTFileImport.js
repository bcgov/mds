import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Field, change, formValueSelector, reduxForm } from "redux-form";
import { bindActionCreators, compose } from "redux";
import PropTypes from "prop-types";
import { Alert, Typography, Row, Col } from "antd";
import { Form } from "@ant-design/compatible";
import { remove } from "lodash";
import { ENVIRONMENT } from "@mds/common";
import * as API from "@common/constants/API";
import {
  createInformationRequirementsTable,
  updateInformationRequirementsTableByFile,
} from "@common/actionCreators/projectActionCreator";
import { getProject } from "@common/selectors/projectSelectors";
import { MODERN_EXCEL } from "@common/constants/fileTypes";
import * as FORM from "@/constants/forms";
import LinkButton from "@/components/common/LinkButton";
import DocumentTable from "@/components/common/DocumentTable";
import customPropTypes from "@/customPropTypes";
import IRTFileUpload from "@/components/Forms/projects/informationRequirementsTable/IRTFileUpload";
import {
  categoryColumn,
  uploadDateTimeColumn,
  importedByColumn,
} from "@/components/common/DocumentColumns";

const propTypes = {
  change: PropTypes.func.isRequired,
  createInformationRequirementsTable: PropTypes.func.isRequired,
  updateInformationRequirementsTableByFile: PropTypes.func.isRequired,
  importIsSuccessful: PropTypes.func.isRequired,
  downloadIRTTemplate: PropTypes.func.isRequired,
  project: customPropTypes.project.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
  informationRequirementsTableDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  projectGuid: PropTypes.string.isRequired,
};

export class IRTFileImport extends Component {
  state = {
    uploadedFiles: [],
  };

  acceptedFileTypesMap = {
    ...MODERN_EXCEL,
  };

  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ document_name: fileName, document_manager_guid });
    return this.props.change("final_irt", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change("final_irt", this.props.documents);
  };

  marshalImportIRTError = (error) => {
    // Transform single quotes on object properties to double to allow JSON parse
    const formattedError = error.replaceAll("'", '"');
    const regex = /({'row_number': \d+, 'section': \d+})/g;
    const errorMatch = formattedError.match(regex);
    return errorMatch.map((e) => JSON.parse(e));
  };

  render() {
    const acceptFileTypeArray = Object.keys(this.acceptedFileTypesMap);
    const documentColumns = [
      categoryColumn(
        "information_requirements_table_document_type_code",
        this.props.informationRequirementsTableDocumentTypesHash
      ),
      uploadDateTimeColumn("upload_date"),
      importedByColumn("create_user"),
    ];
    return (
      <>
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
                  this.props.downloadIRTTemplate(
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
                documents={this.props.project?.information_requirements_table?.documents}
                documentParent="Information Requirements Table"
                documentColumns={documentColumns}
              />
              <br />
              {this.props.project?.information_requirements_table?.status_code === "SUB" && (
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
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                createInformationRequirementsTable={this.props.createInformationRequirementsTable}
                updateInformationRequirementsTableByFile={
                  this.props.updateInformationRequirementsTableByFile
                }
                irtGuid={this.props.project?.information_requirements_table?.irt_guid}
                projectGuid={this.props.projectGuid}
                acceptedFileTypesMap={this.acceptedFileTypesMap}
                importIsSuccessful={this.props.importIsSuccessful}
                component={IRTFileUpload}
              />
            </Form.Item>
          </Col>
        </Row>
      </>
    );
  }
}

IRTFileImport.propTypes = propTypes;

const selector = formValueSelector(FORM.INFORMATION_REQUIREMENTS_TABLE);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
  project: getProject(state),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      createInformationRequirementsTable,
      updateInformationRequirementsTableByFile,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.INFORMATION_REQUIREMENTS_TABLE,
    destroyOnUnmount: false,
    touchOnBlur: true,
    forceUnregisterOnUnmount: true,
  })
)(withRouter(IRTFileImport));
