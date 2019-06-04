import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { fromPairs } from "lodash";
import { Form, Button, Popconfirm, Radio } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import VarianceFileUpload from "./VarianceFileUpload";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  change: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.options.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
};

export class AddVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    isApplication: true,
  };

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

  onChange = (e) => {
    this.setState({
      isApplication: e.target.value,
    });
    // reset the date fields if user toggles between application and approved
    this.props.change("received_date", null);
    this.props.change("expiry_date", null);
    this.props.change("issue_date", null);
  };

  render() {
    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit(
          this.props.onSubmit(fromPairs(this.state.uploadedFiles), this.state.isApplication)
        )}
      >
        <Form.Item label="Are you creating an application or an approved variance?">
          <Radio.Group onChange={this.onChange} value={this.state.isApplication}>
            <Radio value> Application </Radio>
            <Radio value={false}> Approved Variance </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Field
            id="compliance_article_id"
            name="compliance_article_id"
            label="Part of Code*"
            placeholder="Select a part of the code"
            component={renderConfig.SELECT}
            validate={[required]}
            data={this.props.complianceCodes}
          />
        </Form.Item>
        <Form.Item label={this.state.isApplication ? "Received date" : "Received date*"}>
          {this.state.isApplication && (
            <p className="p-light">
              If the received date is not specified it will be set to todays date
            </p>
          )}
          <Field
            id="received_date"
            name="received_date"
            component={renderConfig.DATE}
            validate={this.state.isApplication ? [dateNotInFuture] : [required, dateNotInFuture]}
          />
        </Form.Item>
        {!this.state.isApplication && (
          <div>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="expiry_date"
                name="expiry_date"
                label="Expiry date*"
                component={renderConfig.DATE}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="inspector_party_guid"
                name="inspector_party_guid"
                label="Lead inspectors IDIR*"
                component={renderConfig.SELECT}
                validate={[required]}
                data={this.props.inspectors}
              />
            </Form.Item>
          </div>
        )}
        <Form.Item>
          <Field
            id="note"
            name="note"
            label="Description"
            component={renderConfig.AUTO_SIZE_FIELD}
            validate={[maxLength(300)]}
          />
        </Form.Item>
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
            Add Variance
          </Button>
        </div>
      </Form>
    );
  }
}

AddVarianceForm.propTypes = propTypes;

export default reduxForm({
  change,
  form: FORM.ADD_VARIANCE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_VARIANCE),
})(AddVarianceForm);
