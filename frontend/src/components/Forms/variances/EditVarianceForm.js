import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, getFormValues } from "redux-form";
import { fromPairs } from "lodash";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form, Button, Popconfirm, Row, Col } from "antd";
import * as FORM from "@/constants/forms";
import * as String from "@/constants/strings";
import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import VarianceFileUpload from "./VarianceFileUpload";
import CustomPropTypes from "@/customPropTypes";
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
  documentCategoryOptions: CustomPropTypes.options.isRequired,
  statusCode: PropTypes.string.isRequired,
  removeDocument: PropTypes.func.isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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

  onRemoveFile = (fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));
  };

  render() {
    const filesUploaded = this.state.uploadedFiles.length >= 1;
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
                validate={[required]}
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
                approved
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
        <h5>Application details</h5>
        <VarianceDetails
          mineName={this.props.mineName}
          variance={this.props.variance}
          removeDocument={this.props.removeDocument}
          complianceCodesHash={this.props.complianceCodesHash}
          documentCategoryOptionsHash={this.props.documentCategoryOptionsHash}
        />
        <br />
        <h5>upload files</h5>
        <p className="p-light">
          All documents uploaded will be associated with the category selected, if you would like to
          add a different category of documents please submit and edit the variance.
        </p>
        <br />
        <Form.Item>
          <Field
            id="variance_document_category_code"
            name="variance_document_category_code"
            label={filesUploaded ? "Document Category*" : "Document Category"}
            placeholder="Please select category"
            component={renderConfig.SELECT}
            validate={filesUploaded ? [required] : []}
            data={this.props.documentCategoryOptions}
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
            label="As per MA 13(2), affected parties have been notified about this variance application and decision"
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
            disabled={this.props.submitting}
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
  })
)(EditVarianceForm);
