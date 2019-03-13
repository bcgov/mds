import React, { Component } from "react";
import PropTypes from "prop-types";
import CustomPropTypes from "@/customPropTypes";
import { remove } from "lodash";
import { Field, reduxForm } from "redux-form";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, maxLength, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import PermitAmendmentUploadedFilesList from "@/components/mine/Permit/PermitAmendmentUploadedFilesList";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

const originalPermit = "OGP";
const amalgamtedPermit = "ALG";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
  relatedDocuments: PropTypes.arrayOf(CustomPropTypes.mineDocument),
};

const defaultProps = {
  relatedDocuments: [],
};

export class PermitAmendmentForm extends Component {
  state = {
    showUploadFiles: false,
    relatedDocuments: this.props.initialValues.related_documents || [],
  };

  componentDidMount() {
    this.shouldShowUploadFiles(this.state.relatedDocuments);
  }

  shouldShowUploadFiles = (relatedDocuments) => {
    this.setState({
      showUploadFiles:
        this.props.initialValues.permit_amendment_type_code !== amalgamtedPermit ||
        relatedDocuments.length === 0,
    });
  };

  // Attached files handlers

  handleRemovePermitAmendmentDocument = (relatedDocuments, documentGuid) => {
    this.props.handleRemovePermitAmendmentDocument(
      this.props.initialValues.permit_amendment_guid,
      documentGuid
    );
    const newRelatedDocuments = relatedDocuments.filter(
      (doc) => doc.document_guid !== documentGuid
    );
    this.setState({ relatedDocuments: newRelatedDocuments });
    this.shouldShowUploadFiles(newRelatedDocuments);
  };

  // File upload handlers

  onFileLoad = (fileName, document_manager_guid) =>
    this.props.initialValues.uploadedFiles.push({ fileName, document_manager_guid });

  onRemoveFile = (fileItem) => {
    remove(this.props.initialValues.uploadedFiles, {
      document_manager_guid: fileItem.serverId,
    });
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={RenderDate}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            {this.props.initialValues.permit_amendment_type_code !== originalPermit && (
              <Form.Item>
                <Field
                  id="description"
                  name="description"
                  label="Description"
                  component={RenderAutoSizeField}
                  validate={[maxLength(280)]}
                />
              </Form.Item>
            )}
          </Col>
          <Col md={12} sm={24} className="border--left--layout">
            {this.state.relatedDocuments.length > 0 && (
              <Form.Item label="Attached files" style={{ paddingBottom: "10px" }}>
                <Field
                  id="related_documents"
                  name="related_documents"
                  component={PermitAmendmentUploadedFilesList}
                  permitAmendmentGuid={this.props.initialValues.permit_amendment_guid}
                  relatedDocuments={this.state.relatedDocuments}
                  handleRemovePermitAmendmentDocument={this.handleRemovePermitAmendmentDocument}
                />
              </Form.Item>
            )}
            {this.state.showUploadFiles && (
              <Form.Item label="Upload files">
                <Field
                  id="PermitDocumentFileUpload"
                  name="PermitDocumentFileUpload"
                  onFileLoad={this.onFileLoad}
                  onRemoveFile={this.onRemoveFile}
                  mineGuid={this.props.mine_guid}
                  component={PermitAmendmentFileUpload}
                  allowMultiple={
                    this.props.initialValues.permit_amendment_type_code !== amalgamtedPermit
                  }
                />
              </Form.Item>
            )}
          </Col>
        </Row>
        <div className="right center-mobile" style={{ paddingTop: "14px" }}>
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button className="full-mobile" type="secondary">
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            disabled={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

PermitAmendmentForm.propTypes = propTypes;
PermitAmendmentForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.PERMIT_AMENDMENT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.PERMIT_AMENDMENT),
})(PermitAmendmentForm);
