import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, getFormValues } from "redux-form";
import { fromPairs, isEmpty } from "lodash";
import { connect } from "react-redux";
import { compose } from "redux";
import { Row, Col } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import * as String from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import VarianceFileUpload from "./VarianceFileUpload";
import { VarianceDetails } from "../../mine/Variances/VarianceDetails";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  initialValues: PropTypes.any,
  onSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  varianceDocumentCategoryOptions: CustomPropTypes.options.isRequired,
  statusCode: PropTypes.string.isRequired,
  removeDocument: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  varianceDocumentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

const inspectorRequired = (value) =>
  value ? undefined : "This is a required field if the application has been reviewed";

export class EditVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    statusChangedToApproved: false,
    isApprovedOrDenied: false,
  };

  componentWillReceiveProps(nextProps) {
    const statusChanged = this.props.statusCode !== nextProps.statusCode;
    const statusChangedToApproved = nextProps.statusCode === String.VARIANCE_APPROVED_CODE;
    const isApprovedOrDenied =
      nextProps.statusCode === String.VARIANCE_DENIED_CODE ||
      nextProps.statusCode === String.VARIANCE_APPROVED_CODE;
    if (statusChanged) {
      this.setState({
        statusChangedToApproved,
        isApprovedOrDenied,
      });
    }
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));
  };

  render() {
    const filesUploaded = !isEmpty(this.state.uploadedFiles);
    return (
      <FormWrapper
        name={FORM.EDIT_VARIANCE}
        initialValues={this.props.initialValues}
        isModal
        reduxFormConfig={{
          touchOnBlur: false,
          enableReinitialize: true,
        }}
        onSubmit={
          this.props.onSubmit(
            fromPairs(this.state.uploadedFiles),
            this.props.variance,
            this.state.statusChangedToApproved
          )
        }
      >
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Field
              label="Assign a lead inspector"
              id="inspector_party_guid"
              name="inspector_party_guid"
              component={renderConfig.GROUPED_SELECT}
              required={this.state.isApprovedOrDenied}
              validate={this.state.isApprovedOrDenied ? [inspectorRequired] : []}
              data={this.props.inspectors}
            />
          </Col>
          <Col md={12} xs={24}>
            <Field
              id="variance_application_status_code"
              name="variance_application_status_code"
              label="Application Status"
              placeholder="Select a status"
              component={renderConfig.SELECT}
              required
              validate={[required]}
              data={this.props.varianceStatusOptions}
            />
          </Col>
        </Row>
        {this.state.statusChangedToApproved && (
          <div>
            <Field label="Issue date"
              help="If issue date is not specified it will default to the day the application was
                approved."
              id="issue_date" name="issue_date" component={renderConfig.DATE}
            />
            <Field label="Expiry date"
              help="If expiry date is not specified it will default to 5 years from issue date."
              id="expiry_date" name="expiry_date" component={renderConfig.DATE} />
          </div>
        )}
        <h5>Application Details</h5>
        <VarianceDetails
          mineName={this.props.mineName}
          variance={this.props.variance}
          removeDocument={this.props.removeDocument}
          complianceCodesHash={this.props.complianceCodesHash}
          varianceDocumentCategoryOptionsHash={this.props.varianceDocumentCategoryOptionsHash}
        />
        <br />
        <h5>Upload Files</h5>
        <p className="p-light">
          All documents uploaded will be associated with the category selected. If you would like to
          add a different category of document, please submit and re-open the form.
        </p>
        <br />
        <Field
          id="variance_document_category_code"
          name="variance_document_category_code"
          label="Document Category"
          placeholder="Please select category"
          component={renderConfig.SELECT}
          required={filesUploaded}
          validate={
            filesUploaded
              ? [required]
              : []
          }
          data={this.props.varianceDocumentCategoryOptions}
        />
        <Field
          id="VarianceDocumentFileUpload"
          name="VarianceDocumentFileUpload"
          onFileLoad={this.onFileLoad}
          onRemoveFile={this.onRemoveFile}
          mineGuid={this.props.mineGuid}
          component={VarianceFileUpload}
        />
        <Field
          id="parties_notified_ind"
          name="parties_notified_ind"
          label="As per MA 13(2), affected parties have been notified about this variance application and decision."
          type="checkbox"
          component={renderConfig.CHECKBOX}
        />
        <div className="right center-mobile">

          <RenderCancelButton />
          <RenderSubmitButton buttonText="Update" />
        </div>
      </FormWrapper>
    );
  }
}

EditVarianceForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    statusCode: (getFormValues(FORM.EDIT_VARIANCE)(state) || {}).variance_application_status_code,
  }))
)(EditVarianceForm);
