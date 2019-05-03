import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change, getFormValues } from "redux-form";
import { remove } from "lodash";
import { connect } from "react-redux";
import { compose } from "redux";
import { Form, Button, Popconfirm, Row, Col } from "antd";
import * as FORM from "@/constants/forms";
import * as String from "@/constants/strings";
import { renderConfig } from "@/components/common/config";
import { required } from "@/utils/Validate";
import { resetForm, formatDate } from "@/utils/helpers";
import VarianceFileUpload from "./VarianceFileUpload";
import DocumentTable from "@/components/common/DocumentTable";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  mineName: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.options.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  varianceStatusOptions: CustomPropTypes.options.isRequired,
  statusCode: PropTypes.string.isRequired,
};

export class EditVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    documentNameGuidMap: {},
    statusChangedToApproved: false,
  };

  componentWillReceiveProps(nextProps) {
    const statusChanged = this.props.statusCode !== nextProps.statusCode;
    const isApproved = nextProps.statusCode === String.VARIANCE_APPROVED_CODE;
    if (statusChanged) {
      this.setState({
        statusChangedToApproved: isApproved,
      });
    }
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.state.uploadedFiles.push({ documentName, document_manager_guid });
    this.setState(({ documentNameGuidMap }) => ({
      documentNameGuidMap: {
        [document_manager_guid]: documentName,
        ...documentNameGuidMap,
      },
    }));
    change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit(
          this.props.onSubmit(
            this.state.documentNameGuidMap,
            this.props.variance,
            this.state.statusChangedToApproved
          )
        )}
      >
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="inspector_guid"
                name="inspector_guid"
                label={
                  this.state.statusChangedToApproved
                    ? "Assign a Lead inspector*"
                    : "Assign a Lead inspector"
                }
                component={renderConfig.SELECT}
                validate={this.state.statusChangedToApproved ? [required] : []}
                data={this.props.coreUsers}
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
          <Row gutter={16}>
            <Col md={8} lg={24}>
              <Form.Item label="Expiry date">
                <p className="p-light">
                  If expiry date is not specified, it will default to 5 years from issue date.
                </p>
                <Field id="expiry_date" name="expiry_date" component={renderConfig.DATE} />
              </Form.Item>
            </Col>
          </Row>
        )}
        <h5>application details</h5>
        <div className="content--light-grey padding-small">
          <div className="inline-flex padding-small">
            <p className="field-title">Mine</p>
            <p> {this.props.mineName || String.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Part of Code</p>
            <p>{this.props.variance.compliance_article_id || String.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Submission date</p>
            <p>{formatDate(this.props.variance.received_date) || String.EMPTY_FIELD}</p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">OHSC Union</p>
            <p>{this.props.variance.ohsc_ind ? "Yes" : "No"} </p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Union</p>
            <p>{this.props.variance.union_ind ? "Yes" : "No"} </p>
          </div>
          <div className="inline-flex padding-small">
            <p className="field-title">Description</p>
            <p>{this.props.variance.note || String.EMPTY_FIELD}</p>
          </div>
        </div>
        <br />
        <h5>documents</h5>
        <DocumentTable documents={this.props.variance.documents} />
        <br />
        <h5>upload files</h5>
        <p> Please upload all the required documents here for the variance application</p>
        <br />
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
