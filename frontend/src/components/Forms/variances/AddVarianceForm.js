import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { remove } from "lodash";
import { Form, Button, Popconfirm, Radio } from "antd";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture, maxLength } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import VarianceFileUpload from "./VarianceFileUpload";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  mineGuid: PropTypes.string.isRequired,
  coreUsers: CustomPropTypes.dropdownListItem.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

export class AddVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    documentNameGuidMap: {},
    isApplication: true,
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

  onChange = (e) => {
    this.setState({
      isApplication: e.target.value,
    });
  };

  render() {
    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit(
          this.props.onSubmit(this.state.documentNameGuidMap, this.state.isApplication)
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
                id="inspector_guid"
                name="inspector_guid"
                label="Lead inspectors IDIR*"
                component={renderConfig.SELECT}
                validate={[required]}
                data={this.props.coreUsers}
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
  form: FORM.ADD_VARIANCE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_VARIANCE),
})(AddVarianceForm);
