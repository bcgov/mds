import React, { Component } from "react";
import { remove } from "lodash";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Button, Col, Row, Popconfirm } from "antd";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  permitStatusOptions: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

const defaultProps = {};

export class UploadPermitDocumentFrom extends Component {
  state = {
    uploadedFiles: [],
  };

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <FormWrapper onSubmit={this.props.handleSubmit} name={FORM.UPLOAD_PERMIT_DOCUMENT}
        reduxFormConfig={{
          touchOnBlur: false,
          onSubmitSuccess: resetForm(FORM.UPLOAD_PERMIT_DOCUMENT),
        }}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Field
              id="uploadedFiles"
              name="uploadedFiles"
              onFileLoad={this.onFileLoad}
              onRemoveFile={this.onRemoveFile}
              mineGuid={this.props.mineGuid}
              component={PermitAmendmentFileUpload}
              allowMultiple={false}
            />
          </Col>
        </Row>
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
            loading={this.props.submitting}
          >
            {this.props.title}
          </Button>
        </div>
      </FormWrapper>
    );
  }
}

UploadPermitDocumentFrom.propTypes = propTypes;
UploadPermitDocumentFrom.defaultProps = defaultProps;

export default UploadPermitDocumentFrom;
