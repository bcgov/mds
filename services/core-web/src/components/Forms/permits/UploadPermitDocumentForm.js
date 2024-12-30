import React, { Component } from "react";
import { remove } from "lodash";

import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Button, Col, Form, Row, Popconfirm, Divider } from "antd";
import { resetForm } from "@common/utils/helpers";

import * as FORM from "@/constants/forms";
import CustomPropTypes from "@/customPropTypes";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

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
      <Form layout="vertical" onFinish={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item label="Upload Files">
              <Field
                id="uploadedFiles"
                name="uploadedFiles"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mineGuid}
                component={PermitAmendmentFileUpload}
                allowMultiple={false}
              />
            </Form.Item>
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
      </Form>
    );
  }
}

UploadPermitDocumentFrom.propTypes = propTypes;
UploadPermitDocumentFrom.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.UPLOAD_PERMIT_DOCUMENT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.UPLOAD_PERMIT_DOCUMENT),
})(UploadPermitDocumentFrom);
