import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { resetForm } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import {
  required,
  dateNotInFuture,
  validateSelectOptions,
  maxLength,
  protocol,
} from "@common/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import {
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
} from "@common/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import UploadedDocumentsTable from "@/components/common/UploadedDocumentTable";
import {
  PUBLIC_COMMENT,
  ADVERTISEMENT,
  REFERRAL_CODE,
  CONSULTATION_TAB_CODE,
  ADVERTISEMENT_DOC,
} from "@/constants/NOWConditions";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  documentTypeOptions: CustomPropTypes.options.isRequired,
  documentTypeOptionsHash: PropTypes.objectOf(PropTypes.Strings).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  change: PropTypes.func,
  submitting: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  categoriesToShow: PropTypes.arrayOf(PropTypes.String).isRequired,
};

const defaultProps = {
  change: () => {},
};
export class NOWReviewForm extends Component {
  state = {
    uploadedFiles: [],
    existingDocuments: [],
  };

  componentDidMount() {
    this.setState({ existingDocuments: this.props.initialValues.documents });
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));

    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    const filteredDropDownOptions = this.props.documentTypeOptions.filter(({ subType, value }) => {
      if (this.props.type === PUBLIC_COMMENT) {
        return this.props.categoriesToShow.includes(subType) && value !== ADVERTISEMENT_DOC;
      }
      return this.props.categoriesToShow.includes(subType);
    });

    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            {this.props.type === REFERRAL_CODE && (
              <>
                <Form.Item>
                  <Field
                    id="referral_number"
                    name="referral_number"
                    label="E-Referral Number"
                    component={renderConfig.FIELD}
                    validate={[maxLength(16)]}
                  />
                </Form.Item>
                <Form.Item>
                  <Field
                    id="response_date"
                    name="response_date"
                    label="Date Received"
                    component={renderConfig.DATE}
                    validate={[dateNotInFuture]}
                  />
                </Form.Item>
              </>
            )}

            {this.props.type === CONSULTATION_TAB_CODE && (
              <>
                <Form.Item>
                  <Field
                    id="response_url"
                    name="response_url"
                    label="Link to First Nations Consultation System (FNCS)"
                    component={renderConfig.FIELD}
                    validate={[protocol]}
                  />
                </Form.Item>
                <Form.Item>
                  <Field
                    id="referee_name"
                    name="referee_name"
                    label="First Nations Advisor"
                    component={renderConfig.FIELD}
                  />
                </Form.Item>
                <Form.Item>
                  <Field
                    id="response_date"
                    name="response_date"
                    label="Date Received"
                    component={renderConfig.DATE}
                    validate={[dateNotInFuture]}
                  />
                </Form.Item>
              </>
            )}

            {this.props.type === ADVERTISEMENT && (
              <>
                <Form.Item>
                  <Field
                    id="response_date"
                    name="response_date"
                    label="Date Published*"
                    component={renderConfig.DATE}
                    validate={[required, dateNotInFuture]}
                  />
                </Form.Item>
              </>
            )}

            {this.props.type === PUBLIC_COMMENT && (
              <>
                <Form.Item>
                  <Field
                    id="referee_name"
                    name="referee_name"
                    label="Commenter Name"
                    component={renderConfig.FIELD}
                  />
                </Form.Item>
                <Form.Item>
                  <Field
                    id="response_date"
                    name="response_date"
                    label="Response Date*"
                    component={renderConfig.DATE}
                    validate={[required, dateNotInFuture]}
                  />
                </Form.Item>
              </>
            )}
            <br />
            <h5>Document Upload</h5>
            {this.props.type !== ADVERTISEMENT && (
              <p className="p-light">
                All files uploaded will be classified using the selected Category. To upload other
                file types, re-open this form after submitting the current files.
              </p>
            )}
            <br />
            <Form.Item>
              <Field
                id="now_application_document_type_code"
                name="now_application_document_type_code"
                label={
                  this.state.uploadedFiles.length > 0 ? "Document Category*" : "Document Category"
                }
                component={renderConfig.SELECT}
                disabled={this.props.type === ADVERTISEMENT}
                data={filteredDropDownOptions}
                validate={
                  this.state.uploadedFiles.length > 0
                    ? [required, validateSelectOptions(this.props.documentTypeOptions)]
                    : [validateSelectOptions(this.props.documentTypeOptions)]
                }
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="NOWReviewFileUpload"
                name="NOWReviewFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                uploadUrl={NOTICE_OF_WORK_DOCUMENT(this.props.initialValues.now_application_guid)}
                component={FileUpload}
                allowRevert
                allowMultiple
              />
            </Form.Item>
            {this.state.existingDocuments && this.state.existingDocuments.length > 0 && (
              <UploadedDocumentsTable
                showCategory
                documentTypeOptionsHash={this.props.documentTypeOptionsHash}
                files={this.state.existingDocuments.map((doc) => ({
                  now_application_document_type_code: doc.now_application_document_type_code,
                  ...doc.mine_document,
                }))}
                showRemove
                removeFileHandler={(doc_guid) => {
                  this.props.handleDocumentDelete(doc_guid);
                  this.setState((prevState) => ({
                    existingDocuments: prevState.existingDocuments.filter(
                      (obj) => obj.mine_document.mine_document_guid !== doc_guid
                    ),
                  }));
                }}
              />
            )}
          </Col>
        </Row>
        <div className="right center-mobile">
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
            disabled={this.props.submitting}
          >
            <Button className="full-mobile" type="secondary" disabled={this.props.submitting}>
              Cancel
            </Button>
          </Popconfirm>
          <Button
            className="full-mobile"
            type="primary"
            htmlType="submit"
            loading={this.props.submitting}
          >
            Save
          </Button>
        </div>
      </Form>
    );
  }
}
NOWReviewForm.propTypes = propTypes;
NOWReviewForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    documentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(state),
    documentTypeOptionsHash: getNoticeOfWorkApplicationDocumentTypeOptionsHash(state),
  })),

  reduxForm({
    form: FORM.ADD_NOW_REVIEW,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.ADD_NOW_REVIEW),
  })
)(NOWReviewForm);
