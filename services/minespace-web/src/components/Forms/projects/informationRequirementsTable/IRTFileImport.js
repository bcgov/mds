import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change, formValueSelector, reduxForm } from "redux-form";
import { createInformationRequirementsTable } from "@common/actionCreators/projectActionCreator";
import { Form } from "@ant-design/compatible";
import { connect } from "react-redux";
import { remove } from "lodash";
import { Typography, Row, Col } from "antd";
import { bindActionCreators, compose } from "redux";
import { withRouter } from "react-router-dom";
import IRTFileUpload from "@/components/Forms/projects/informationRequirementsTable/IRTFileUpload";
import * as FORM from "@/constants/forms";
import { MODERN_EXCEL } from "@/constants/fileTypes";

const propTypes = {
  change: PropTypes.func.isRequired,
  createInformationRequirementsTable: PropTypes.func.isRequired,
  documents: PropTypes.arrayOf(PropTypes.objectOf(PropTypes.string)).isRequired,
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
              <Field
                id="final_irt"
                name="final_irt"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                createInformationRequirementsTable={this.props.createInformationRequirementsTable}
                projectGuid={this.props.projectGuid}
                acceptedFileTypesMap={this.acceptedFileTypesMap}
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
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      createInformationRequirementsTable,
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
