import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change } from "redux-form";
import { remove } from "lodash";
import { Typography, Form } from "antd";
import { required, maxLength } from "@mds/common/redux/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import VarianceFileUpload from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  complianceCodes: CustomPropTypes.options.isRequired,
};

export class AddVarianceForm extends Component {
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
    remove(this.state.documentNameGuidMap, { document_manager_guid: fileItem.serverId });
    change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <FormWrapper
        onSubmit={() => this.props.onSubmit(this.state.documentNameGuidMap)}
        isModal
        name={FORM.ADD_VARIANCE}
        reduxFormConfig={{
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.ADD_VARIANCE),
        }}
      >
        <Field
          id="compliance_article_id"
          name="compliance_article_id"
          label="Part of Code"
          required
          placeholder="Select a part of the code"
          component={renderConfig.SELECT}
          validate={[required]}
          data={this.props.complianceCodes}
        />
        <Field
          id="note"
          name="note"
          label="Description"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(300)]}
        />
        <Form.Item label="Attached Files">
          <Typography.Paragraph>Please upload all of the required documents.</Typography.Paragraph>
          <Field
            id="uploadedFiles"
            name="uploadedFiles"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            mineGuid={this.props.mineGuid}
            component={VarianceFileUpload}
          />
        </Form.Item>
        <div className="ant-modal-footer">
          <RenderCancelButton />
          <RenderSubmitButton buttonText="Submit" />
        </div>
      </FormWrapper>
    );
  }
}

AddVarianceForm.propTypes = propTypes;

export default AddVarianceForm;
