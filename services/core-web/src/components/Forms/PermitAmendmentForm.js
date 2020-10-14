import React, { Component } from "react";
import PropTypes from "prop-types";
import { remove } from "lodash";
import { Field, reduxForm, change } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, maxLength, dateNotInFuture, number } from "@common/utils/Validate";
import { resetForm, currencyMask } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import PartySelectField from "@/components/common/PartySelectField";
import * as FORM from "@/constants/forms";
import PermitAmendmentUploadedFilesList from "@/components/mine/Permit/PermitAmendmentUploadedFilesList";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import { USER_ROLES } from "@common/constants/environment";

const originalPermit = "OGP";
const amalgamtedPermit = "ALG";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  handleRemovePermitAmendmentDocument: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
  permit_guid: PropTypes.string.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any),
  change: PropTypes.func,
  is_historical_amendment: PropTypes.bool.isRequired,
  userRoles: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const defaultProps = {
  initialValues: {},
  change,
};

const validateBusinessRules = (values) => {
  const errors = {};
  if (values.amendments && values.permit_amendment_type_code !== originalPermit) {
    const originalPermitAmendment = values.amendments.filter(
      (x) => x.permit_amendment_type_code === originalPermit
    )[0];
    const mostRecentAmendment = values.amendments[0];
    const isHistoricalAmendmentsAllowed =
      values.is_historical_amendment &&
      values.userRoles &&
      values.userRoles.some((role) => USER_ROLES.role_edit_historical_amendments === role);
    if (
      !isHistoricalAmendmentsAllowed &&
      originalPermitAmendment &&
      values.issue_date < originalPermitAmendment.issue_date
    ) {
      errors.issue_date = "Date cannot be before the permit's first issue date";
    }
    if (
      !isHistoricalAmendmentsAllowed &&
      values.is_historical_amendment &&
      mostRecentAmendment &&
      values.issue_date < mostRecentAmendment.issue_date
    ) {
      errors.issue_date = "Date cannot be before the last amendment's issue date";
    }
  }

  return errors;
};

export class PermitAmendmentForm extends Component {
  state = {
    showUploadFiles: false,
    relatedDocuments: this.props.initialValues.related_documents || [],
    uploadedFiles: [],
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
      this.props.permit_guid,
      this.props.initialValues.permit_amendment_guid,
      documentGuid
    );
    const newRelatedDocuments = relatedDocuments.filter(
      (doc) => doc.permit_amendment_document_guid !== documentGuid
    );
    this.setState({ relatedDocuments: newRelatedDocuments });
    this.shouldShowUploadFiles(newRelatedDocuments);
  };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={48}>
          <Col md={12} sm={24}>
            {!this.props.is_historical_amendment &&
              !this.props.initialValues.permit_amendment_guid && (
                <Form.Item>
                  <PartySelectField
                    id="permittee_party_guid"
                    name="permittee_party_guid"
                    label="Permittee*"
                    partyLabel="permittee"
                    validate={[required]}
                    allowAddingParties
                  />
                </Form.Item>
              )}
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue Date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            <Form.Item label="Assessed Liability">
              <p className="p-light">
                This amount will be added to the Total Assessed Liability amount for this permit.
                Changes to this value in CORE will not be updated in MMS.
              </p>
              <Field
                id="security_adjustment"
                name="security_adjustment"
                component={renderConfig.FIELD}
                {...currencyMask}
                validate={[number]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                label="Security Received"
                id="security_received_date"
                name="security_received_date"
                component={renderConfig.DATE}
              />
            </Form.Item>
            {this.props.initialValues.permit_amendment_type_code !== originalPermit && (
              <Form.Item>
                <Field
                  id="description"
                  name="description"
                  label="Description"
                  component={renderConfig.AUTO_SIZE_FIELD}
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
            loading={this.props.submitting}
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
  validate: validateBusinessRules,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.PERMIT_AMENDMENT),
})(PermitAmendmentForm);
