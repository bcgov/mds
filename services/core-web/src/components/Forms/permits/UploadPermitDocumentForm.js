import React, { Component } from "react";
import { remove } from "lodash";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import * as FORM from "@/constants/forms";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";
import FormWrapper from "@mds/common/components/forms/FormWrapper";
import RenderSubmitButton from "@mds/common/components/forms/RenderSubmitButton";
import RenderCancelButton from "@mds/common/components/forms/RenderCancelButton";

const propTypes = {
  onSubmit: PropTypes.func.isRequired,
  mineGuid: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  change: PropTypes.func.isRequired
};

const defaultProps = {};

export class UploadPermitDocumentFrom extends Component {
  state = {
    uploadedFiles: [],
  };

  formName = FORM.UPLOAD_PERMIT_DOCUMENT;

  // File upload handlers
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.props.change(this.formName, "uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    this.props.change(this.formName, "uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <FormWrapper onSubmit={this.props.onSubmit} name={FORM.UPLOAD_PERMIT_DOCUMENT}
        isModal
        reduxFormConfig={{
          touchOnBlur: false,
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
          <RenderCancelButton />
          <RenderSubmitButton buttonText={this.props.title} />
        </div>
      </FormWrapper>
    );
  }
}

UploadPermitDocumentFrom.propTypes = propTypes;
UploadPermitDocumentFrom.defaultProps = defaultProps;

export default UploadPermitDocumentFrom;
