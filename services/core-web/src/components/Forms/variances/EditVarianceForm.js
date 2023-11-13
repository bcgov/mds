import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { fromPairs, isEmpty } from "lodash";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm, Row, Col } from "antd";
import { required, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as String from "@mds/common/constants/strings";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import VarianceFileUpload from "./VarianceFileUpload";
import { VarianceDetails } from "../../mine/Variances/VarianceDetails";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
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
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit(
          this.props.onSubmit(
            fromPairs(this.state.uploadedFiles),
            this.props.variance,
            this.state.statusChangedToApproved
          )
        )}
      >
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item
              label={
                this.state.isApprovedOrDenied
                  ? "Assign a lead inspector*"
                  : "Assign a lead inspector"
              }
            >
              <Field
                id="inspector_party_guid"
                name="inspector_party_guid"
                component={renderConfig.GROUPED_SELECT}
                validate={this.state.isApprovedOrDenied ? [inspectorRequired] : []}
                data={this.props.inspectors}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="variance_application_status_code"
                name="variance_application_status_code"
                label="Application Status"
                placeholder="Select a status"
                component={renderConfig.SELECT}
                validate={[required, validateSelectOptions(this.props.varianceStatusOptions)]}
                data={this.props.varianceStatusOptions}
              />
            </Form.Item>
          </Col>
        </Row>
        {this.state.statusChangedToApproved && (
          <div>
            <Form.Item label="Issue date">
              <p className="p-light">
                If issue date is not specified it will default to the day the application was
                approved.
              </p>
              <Field id="issue_date" name="issue_date" component={renderConfig.DATE} />
            </Form.Item>
            <Form.Item label="Expiry date">
              <p className="p-light">
                If expiry date is not specified it will default to 5 years from issue date.
              </p>
              <Field id="expiry_date" name="expiry_date" component={renderConfig.DATE} />
            </Form.Item>
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
        <Form.Item>
          <Field
            id="variance_document_category_code"
            name="variance_document_category_code"
            label={filesUploaded ? "Document Category*" : "Document Category"}
            placeholder="Please select category"
            component={renderConfig.SELECT}
            validate={
              filesUploaded
                ? [required, validateSelectOptions(this.props.varianceDocumentCategoryOptions)]
                : [validateSelectOptions(this.props.varianceDocumentCategoryOptions)]
            }
            data={this.props.varianceDocumentCategoryOptions}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="VarianceDocumentFileUpload"
            name="VarianceDocumentFileUpload"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            mineGuid={this.props.mineGuid}
            component={VarianceFileUpload}
          />
        </Form.Item>
        <Form.Item>
          <Field
            id="parties_notified_ind"
            name="parties_notified_ind"
            label="As per MA 13(2), affected parties have been notified about this variance application and decision."
            type="checkbox"
            component={renderConfig.CHECKBOX}
          />
        </Form.Item>
        <div className="right center-mobile">
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
            Update
          </Button>
        </div>
      </Form>
    );
  }
}

EditVarianceForm.propTypes = propTypes;

export default compose(
  connect((state) => ({
    statusCode: (getFormValues(FORM.EDIT_VARIANCE)(state) || {}).variance_application_status_code,
  })),
  reduxForm({
    form: FORM.EDIT_VARIANCE,
    touchOnBlur: false,
    onSubmitSuccess: resetForm(FORM.EDIT_VARIANCE),
    enableReinitialize: true,
  })
)(EditVarianceForm);
