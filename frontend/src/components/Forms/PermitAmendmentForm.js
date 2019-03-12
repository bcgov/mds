import React, { Component } from "react";
import PropTypes from "prop-types";
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

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
};

class PermitAmendmentForm extends Component {
  onFileLoad = (fileName, document_manager_guid) =>
    this.props.initialValues.uploadedFiles.push({ fileName, document_manager_guid });

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
            <Form.Item label="Attached files">
              <Field
                id="related_documents"
                name="related_documents"
                component={PermitAmendmentUploadedFilesList}
                permitAmendmentGuid={this.props.initialValues.permit_amendment_guid}
                relatedDocuments={this.props.initialValues.related_documents}
                handleRemovePermitAmendmentDocument={this.props.handleRemovePermitAmendmentDocument}
              />
            </Form.Item>
            <Form.Item label="Upload files" style={{ paddingTop: "10px" }}>
              <Field
                id="PermitDocumentFileUpload"
                name="PermitDocumentFileUpload"
                onFileLoad={this.onFileLoad}
                mineGuid={this.props.mine_guid}
                component={PermitAmendmentFileUpload}
              />
            </Form.Item>
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

export default reduxForm({
  form: FORM.PERMIT_AMENDMENT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.PERMIT_AMENDMENT),
})(PermitAmendmentForm);
