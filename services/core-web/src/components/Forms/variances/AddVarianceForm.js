import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change } from "redux-form";
import { fromPairs } from "lodash";
import { Radio, Form } from "antd";
import {
  required,
  dateNotInFuture,
  maxLength,
} from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import VarianceFileUpload from "./VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  change: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  documentCategoryOptions: CustomPropTypes.options.isRequired,
  mineGuid: PropTypes.string.isRequired,
  inspectors: CustomPropTypes.groupOptions.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
};

export class AddVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    isApplication: true,
  };

  formName = FORM.ADD_VARIANCE;

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

  onChange = (e) => {
    this.setState({
      isApplication: e.target.value,
    });
    // reset the date fields if user toggles between application and approved
    this.props.change(this.formName, "received_date", null);
    this.props.change(this.formName, "expiry_date", null);
    this.props.change(this.formName, "issue_date", null);
  };

  render() {
    const filesUploaded = this.state.uploadedFiles.length >= 1;
    return (
      <FormWrapper
        name={FORM.ADD_VARIANCE}
        reduxFormConfig={{
          change,
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.ADD_VARIANCE),
          enableReinitialize: true,
        }}
        onSubmit={
          this.props.onSubmit(fromPairs(this.state.uploadedFiles), this.state.isApplication)
        }
      >
        <Form.Item label="Are you creating an application or an approved variance?">
          <Radio.Group onChange={this.onChange} value={this.state.isApplication}>
            <Radio value> Application </Radio>
            <Radio value={false}> Approved Variance </Radio>
          </Radio.Group>
        </Form.Item>
        <Field
          id="compliance_article_id"
          name="compliance_article_id"
          label="Part of Code"
          placeholder="Select a part of the code"
          component={renderConfig.SELECT}
          required
          validate={[required]}
          data={this.props.complianceCodes}
        />

        <Field
          label="Received date"
          help=" If the received date is not specified it will be set to today&apos;s date."
          id="received_date"
          name="received_date"
          component={renderConfig.DATE}
          required={!this.state.isApplication}
          validate={this.state.isApplication ? [dateNotInFuture] : [required, dateNotInFuture]}
        />
        {!this.state.isApplication && (
          <div>
            <Field
              id="issue_date"
              name="issue_date"
              label="Issue date"
              component={renderConfig.DATE}
              required
              validate={[required, dateNotInFuture]}
            />
            <Field
              id="expiry_date"
              name="expiry_date"
              label="Expiry date"
              component={renderConfig.DATE}
              required
              validate={[required]}
            />
            <Field
              id="inspector_party_guid"
              name="inspector_party_guid"
              label="Lead inspector"
              component={renderConfig.GROUPED_SELECT}
              required
              validate={[required]}
              data={this.props.inspectors}
            />
          </div>
        )}
        <Field
          id="note"
          name="note"
          label="Description"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(300)]}
        />
        <br />
        <h5>upload files</h5>
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
          data={this.props.documentCategoryOptions}
        />
        <Field
          id="VarianceDocumentFileUpload"
          name="VarianceDocumentFileUpload"
          onFileLoad={this.onFileLoad}
          onRemoveFile={this.onRemoveFile}
          mineGuid={this.props.mineGuid}
          component={VarianceFileUpload}
        />
        {!this.state.isApplication && (
          <Field
            id="parties_notified_ind"
            name="parties_notified_ind"
            label="As per MA 13(2), affected parties have been notified about this variance application and decision"
            type="checkbox"
            component={renderConfig.CHECKBOX}
          />
        )}
        <div className="right center-mobile">
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Add Variance" />
        </div>
      </FormWrapper>
    );
  }
}

AddVarianceForm.propTypes = propTypes;

export default AddVarianceForm;
