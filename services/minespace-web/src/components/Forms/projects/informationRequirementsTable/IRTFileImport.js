import React, { Component } from "react";
import PropTypes from "prop-types";
import customPropTypes from "@/customPropTypes";
import { Field, change, formValueSelector, reduxForm } from "redux-form";
import {
  createInformationRequirementsTable,
  updateInformationRequirementsTableByFile,
} from "@common/actionCreators/projectActionCreator";
import { getProject } from "@common/selectors/projectSelectors";
import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Typography, Row, Col } from "antd";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import IRTFileUpload from "@/components/Forms/projects/informationRequirementsTable/IRTFileUpload";
import * as FORM from "@/constants/forms";
import { MODERN_EXCEL } from "@/constants/fileTypes";
import DocumentTable from "@/components/common/DocumentTable";

const propTypes = {
  change: PropTypes.func.isRequired,
  createInformationRequirementsTable: PropTypes.func.isRequired,
  updateInformationRequirementsTableByFile: PropTypes.func.isRequired,
  importIsSuccessful: PropTypes.func.isRequired,
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
    return (
      <>
        <Row>
          <Col span={24}>
            <Typography.Title level={4}>Import final IRT file</Typography.Title>
            <Typography.Paragraph>
              Please upload your final IRT file.
              <ul>
                <li>You cannot upload ZIP files</li>
                <li>The allowed file types are: {acceptFileTypeArray.join(", ")}</li>
                <li>Maximum individual file size is 400 MB</li>
                <li>You can only upload one file at a time</li>
              </ul>
            </Typography.Paragraph>
            <Form.Item wrapperCol={{ lg: 24 }} style={{ width: "100%", marginRight: 0 }}>
              <DocumentTable
                documents={this.props.project?.information_requirements_table?.documents}
                documentCategoryOptionsHash={
                  this.props.informationRequirementsTableDocumentTypesHash
                }
                documentParent="Information Requirements Table"
                categoryDataIndex="information_requirements_table_document_type_code"
                uploadDateIndex="upload_date"
              />
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
