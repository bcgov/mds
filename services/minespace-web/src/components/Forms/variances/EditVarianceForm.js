import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, change } from "redux-form";
import { remove } from "lodash";
import { Button, Popconfirm, Typography, Form } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";
import VarianceFileUpload from "@/components/Forms/variances/VarianceFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.any,
  closeModal: PropTypes.func.isRequired,
  removeDocument: PropTypes.func.isRequired,
  mineName: PropTypes.string.isRequired,
  mineGuid: PropTypes.string.isRequired,
  variance: CustomPropTypes.variance.isRequired,
  submitting: PropTypes.bool.isRequired,
  varianceStatusOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
  complianceCodesHash: PropTypes.objectOf(PropTypes.string).isRequired,
  documentCategoryOptionsHash: PropTypes.objectOf(PropTypes.string).isRequired,
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

  handleSubmit = () => {
    const codeLabel = this.props.complianceCodesHash[this.props.variance.compliance_article_id];
    this.props.onSubmit(
      this.state.documentNameGuidMap,
      this.props.variance.variance_guid,
      codeLabel
    );
  };

  render() {
    return (
      <FormWrapper
        initialValues={this.props.initialValues}
        onSubmit={this.handleSubmit}
        name={FORM.EDIT_VARIANCE}
        reduxFormConfig={{
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.EDIT_VARIANCE),
        }}
      >
        <VarianceDetails
          mineName={this.props.mineName}
          variance={this.props.variance}
          removeDocument={this.props.removeDocument}
          varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
          documentCategoryOptionsHash={this.props.documentCategoryOptionsHash}
          complianceCodesHash={this.props.complianceCodesHash}
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
          <Popconfirm
            placement="topRight"
            title="Are you sure you want to cancel?"
            onConfirm={this.props.closeModal}
            okText="Yes"
            cancelText="No"
          >
            <Button>Cancel</Button>
          </Popconfirm>
          <Button type="primary" htmlType="submit" loading={this.props.submitting}>
            Submit
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

EditVarianceForm.propTypes = propTypes;

export default EditVarianceForm;
