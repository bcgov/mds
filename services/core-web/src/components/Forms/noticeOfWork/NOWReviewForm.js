import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import {
  required,
  dateNotInFuture,
  maxLength,
  protocol,
} from "@mds/common/redux/utils/Validate";
import CustomPropTypes from "@/customPropTypes";
import {
  getDropdownNoticeOfWorkApplicationDocumentTypeOptions,
  getNoticeOfWorkApplicationDocumentTypeOptionsHash,
} from "@mds/common/redux/selectors/staticContentSelectors";
import { NOTICE_OF_WORK_DOCUMENT } from "@mds/common/constants/API";
import FileUpload from "@/components/common/FileUpload";
import UploadedDocumentsTable from "@/components/common/UploadedDocumentTable";
import {
  PUBLIC_COMMENT,
  ADVERTISEMENT,
  REFERRAL_CODE,
  CONSULTATION_TAB_CODE,
  ADVERTISEMENT_DOC,
} from "@/constants/NOWConditions";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  documentTypeOptions: CustomPropTypes.options.isRequired,
  documentTypeOptionsHash: PropTypes.objectOf(PropTypes.Strings).isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
  change: PropTypes.func,
  type: PropTypes.string.isRequired,
  categoriesToShow: PropTypes.arrayOf(PropTypes.String).isRequired,
};

const defaultProps = {
  change: () => { },
};
export class NOWReviewForm extends Component {
  state = {
    uploadedFiles: [],
    existingDocuments: [],
  };
  formName = FORM.ADD_NOW_REVIEW;

  componentDidMount() {
    this.setState({ existingDocuments: this.props.initialValues.documents });
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
    this.props.change(this.formName, "uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));

    this.props.change(this.formName, "uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    const filteredDropDownOptions = this.props.documentTypeOptions.filter(({ subType, value }) => {
      if (this.props.type === PUBLIC_COMMENT) {
        return this.props.categoriesToShow.includes(subType) && value !== ADVERTISEMENT_DOC;
      }
      return this.props.categoriesToShow.includes(subType);
    });

    return (
      <FormWrapper onSubmit={this.props.onSubmit}
        isModal
        initialValues={this.props.initialValues}
        name={FORM.ADD_NOW_REVIEW}
        reduxFormConfig={{
          touchOnBlur: false,
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            {this.props.type === REFERRAL_CODE && (
              <>
                <Field
                  id="referral_number"
                  name="referral_number"
                  label="E-Referral Number"
                  component={renderConfig.FIELD}
                  validate={[maxLength(16)]}
                />
                <Field
                  id="response_date"
                  name="response_date"
                  label="Date Received"
                  component={renderConfig.DATE}
                  validate={[dateNotInFuture]}
                />
              </>
            )}

            {this.props.type === CONSULTATION_TAB_CODE && (
              <>
                <Field
                  id="response_url"
                  name="response_url"
                  label="Link to First Nations Consultation System (FNCS)"
                  component={renderConfig.FIELD}
                  validate={[protocol]}
                />
                <Field
                  id="referee_name"
                  name="referee_name"
                  label="First Nations Advisor"
                  component={renderConfig.FIELD}
                />
                <Field
                  id="response_date"
                  name="response_date"
                  label="Date Received"
                  component={renderConfig.DATE}
                  validate={[dateNotInFuture]}
                />
              </>
            )}

            {this.props.type === ADVERTISEMENT && (
              <Field
                id="response_date"
                name="response_date"
                label="Date Published"
                component={renderConfig.DATE}
                required
                validate={[required, dateNotInFuture]}
              />
            )}

            {this.props.type === PUBLIC_COMMENT && (
              <>
                <Field
                  id="referee_name"
                  name="referee_name"
                  label="Commenter Name"
                  component={renderConfig.FIELD}
                />
                <Field
                  id="response_date"
                  name="response_date"
                  label="Response Date"
                  component={renderConfig.DATE}
                  required
                  validate={[required, dateNotInFuture]}
                />
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
            <Field
              id="now_application_document_type_code"
              name="now_application_document_type_code"
              label="Document Category"
              component={renderConfig.SELECT}
              disabled={this.props.type === ADVERTISEMENT}
              data={filteredDropDownOptions}
              required={this.state.uploadedFiles.length > 0}
              validate={
                this.state.uploadedFiles.length > 0
                  ? [required]
                  : []
              }
            />
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
            {this.state.existingDocuments && this.state.existingDocuments.length > 0 && (
              <UploadedDocumentsTable
                showCategory
                documentTypeOptionsHash={this.props.documentTypeOptionsHash}
                files={this.state.existingDocuments
                  .filter((doc) => doc.mine_document?.mine_document_guid)
                  .map((doc) => ({
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
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Save" disableOnClean={false} />
        </div>
      </FormWrapper>
    );
  }
}
NOWReviewForm.propTypes = propTypes;
NOWReviewForm.defaultProps = defaultProps;

export default compose(
  connect((state) => ({
    documentTypeOptions: getDropdownNoticeOfWorkApplicationDocumentTypeOptions(state),
    documentTypeOptionsHash: getNoticeOfWorkApplicationDocumentTypeOptionsHash(state),
  }))
)(NOWReviewForm);
