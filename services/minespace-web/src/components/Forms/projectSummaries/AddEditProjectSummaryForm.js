// TODO - Determine how to clear ProjectSummaryFileUpload state after successfully saving in edit mode

import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { compose, bindActionCreators } from "redux";
import { Field, reduxForm, change, arrayPush, formValueSelector } from "redux-form";
import { remove } from "lodash";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm, Typography } from "antd";
import { required, maxLength } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";
import DocumentTable from "@/components/common/DocumentTable";
import ProjectSummaryFileUpload from "@/components/Forms/projectSummaries/ProjectSummaryFileUpload";

const propTypes = {
  initialValues: CustomPropTypes.projectSummary,
  mineGuid: PropTypes.string.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  projectSummaryDocumentTypesHash: PropTypes.objectOf(PropTypes.string).isRequired,
};

export class AddEditProjectSummaryForm extends Component {
  state = {
    uploadedFiles: [],
  };

  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ document_name: fileName, document_manager_guid });
    this.props.change("documents", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.props.documents, { document_manager_guid: fileItem.serverId });
    return this.props.change(FORM.ADD_EDIT_PROJECT_SUMMARY, "documents", this.props.documents);
  };

  render() {
    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit}
      >
        <Field
          id="project_summary_date"
          name="project_summary_date"
          label="Date"
          placeholder="Please select date"
          component={renderConfig.DATE}
          validate={[required]}
        />
        <Field
          id="project_summary_description"
          name="project_summary_description"
          label="Description of Work"
          component={renderConfig.AUTO_SIZE_FIELD}
          validate={[maxLength(300)]}
        />
        <Form.Item label="Attached Files">
          {this.props.isEditMode &&
            <DocumentTable
              documents={this.props.initialValues.documents}
              documentCategoryOptionsHash={this.props.projectSummaryDocumentTypesHash}
              documentParent={"project summary"}
              categoryDataIndex={"project_summary_document_type_code"}
              uploadDateIndex={"upload_date"}
            />
          }
          <Typography.Paragraph>Please upload all of the required documents.</Typography.Paragraph>
          <Field
            id="documents"
            name="documents"
            onFileLoad={this.onFileLoad}
            onRemoveFile={this.onRemoveFile}
            mineGuid={this.props.mineGuid}
            component={ProjectSummaryFileUpload}
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
            {this.props.isEditMode ? 'Save' : 'Submit'}
          </Button>
        </div>
      </Form>
    );
  }
};

AddEditProjectSummaryForm.propTypes = propTypes;

const selector = formValueSelector(FORM.ADD_EDIT_PROJECT_SUMMARY);
const mapStateToProps = (state) => ({
  documents: selector(state, "documents"),
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      change,
      arrayPush,
    },
    dispatch
  );

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  reduxForm({
    form: FORM.ADD_EDIT_PROJECT_SUMMARY,
    touchOnBlur: true,
    touchOnChange: false,
    enableReinitialize: true,
  })
)(AddEditProjectSummaryForm);
