import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { remove } from "lodash";
import { Form, Button, Popconfirm, Typography } from "antd";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import { resetForm } from "@/utils/helpers";
import { VarianceDetails } from "@/components/dashboard/mine/variances/VarianceDetails";
import VarianceFileUpload from "@/components/Forms/variances/VarianceFileUpload";

const { Paragraph } = Typography;

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
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

  handleSubmit = (event) => {
    const codeLabel = this.props.complianceCodesHash[this.props.variance.compliance_article_id];
    event.preventDefault();
    this.props.onSubmit(
      this.state.documentNameGuidMap,
      this.props.variance.variance_guid,
      codeLabel
    );
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={(event) => this.handleSubmit(event)}>
        <VarianceDetails
          mineName={this.props.mineName}
          variance={this.props.variance}
          removeDocument={this.props.removeDocument}
          varianceStatusOptionsHash={this.props.varianceStatusOptionsHash}
          documentCategoryOptionsHash={this.props.documentCategoryOptionsHash}
          complianceCodesHash={this.props.complianceCodesHash}
        />
        <Form.Item label="Attached Files">
          <Paragraph>Please upload all of the required documents.</Paragraph>
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
          <Button type="primary" htmlType="submit" disabled={this.props.submitting}>
            Submit
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
