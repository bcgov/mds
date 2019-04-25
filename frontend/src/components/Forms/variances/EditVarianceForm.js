import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { remove } from "lodash";
import { Form, Button, Popconfirm, Row, Col } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import VarianceFileUpload from "./VarianceFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
};

export class EditVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    documentNameGuidMap: {},
  };

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
        onSubmit={this.props.handleSubmit(this.props.onSubmit(this.state.documentNameGuidMap))}
      >
        <Row gutter={16}>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="title"
                name="title"
                label="Assign a lead inspector"
                component={renderConfig.SELECT}
                validate={[required]}
                data={[
                  { value: 1, label: "Meredith" },
                  { value: 2, label: "Jon" },
                  { value: 3, label: "Nathan" },
                  { value: 4, label: "Tatianna" },
                  { value: 5, label: "Gyan" },
                ]}
              />
            </Form.Item>
          </Col>
          <Col md={12} xs={24}>
            <Form.Item>
              <Field
                id="application_status"
                name="application_status"
                label="Application Status"
                placeholder="Select a status"
                component={renderConfig.SELECT}
                validate={[required]}
                data={[
                  { value: 1, label: "In-Review" },
                  { value: 2, label: "Approved" },
                  { value: 3, label: "Denied" },
                  { value: 4, label: "Not-Applicable" },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <p className="center">
          Is this an existing approved variance? Please specify the dates below, if not, please
          submit to complete
        </p>
        <br />
        <Row gutter={16}>
          <Col md={8} xs={24}>
            <Form.Item>
              <Field
                id="received_date"
                name="received_date"
                label="Received date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item>
              <Field
                id="expiry_date"
                name="expiry_date"
                label="Expiry date*"
                component={renderConfig.DATE}
                validate={[required]}
              />
            </Form.Item>
          </Col>
        </Row>
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
            Add Variance
          </Button>
        </div>
      </Form>
    );
  }
}

EditVarianceForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.EDIT_VARIANCE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.EDIT_VARIANCE),
})(EditVarianceForm);
