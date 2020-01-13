import React, { Component } from "react";
import PropTypes from "prop-types";
import { reduxForm, Field } from "redux-form";
import { Form, Button, Col, Row, Popconfirm } from "antd";

import * as FORM from "@/constants/forms";
import { resetForm } from "@/utils/helpers";
import { renderConfig } from "@/components/common/config";
import { required, dateNotInFuture } from "@/utils/Validate";
import CustomPropTypes from "@/customPropTypes";

import { NOTICE_OF_WORK_DOCUMENT } from "@/constants/API";
import FileUpload from "@/components/common/FileUpload";
import { UploadedDocumentsTable } from "@/components/common/UploadedDocumentTable";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  handleDocumentDelete: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  review_types: CustomPropTypes.options.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  initialValues: PropTypes.any,
  // eslint-disable-next-line
  change: PropTypes.func,
};
const defaultProps = {
  initialValues: {},
  change: () => {},
};

export class NOWReviewForm extends Component {
  state = {
    uploadedFiles: [],
    existingDocuments: [],
  };

  componentDidMount() {
    this.setState({ existingDocuments: this.props.initialValues.documents });
  }

  onFileLoad = (documentName, document_manager_guid) => {
    this.setState((prevState) => ({
      uploadedFiles: [[document_manager_guid, documentName], ...prevState.uploadedFiles],
    }));
    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  onRemoveFile = (err, fileItem) => {
    this.setState((prevState) => ({
      uploadedFiles: prevState.uploadedFiles.filter((fileArr) => fileArr[0] !== fileItem.serverId),
    }));

    this.props.change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col>
            <Form.Item>
              <Field
                id="now_application_review_type_code"
                name="now_application_review_type_code"
                label="Review Type"
                component={renderConfig.SELECT}
                data={this.props.review_types}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="referee_name"
                name="referee_name"
                label="Referee Name"
                component={renderConfig.FIELD}
                validate={[required]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="response_date"
                name="response_date"
                label="Response Recieved"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>{" "}
            <Form.Item>
              <Field
                id="NOWReviewFileUpload"
                name="NOWReviewFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                uploadUrl={NOTICE_OF_WORK_DOCUMENT(this.props.initialValues.now_application_guid)}
                component={FileUpload}
                allowRevert
                allowMultiple
              />
            </Form.Item>
            {this.state.existingDocuments && this.state.existingDocuments.length > 0 && (
              <UploadedDocumentsTable
                files={this.state.existingDocuments.map((doc) => doc.mine_document)}
                showRemove
                removeFileHandler={(doc_guid) => {
                  this.props.handleDocumentDelete(doc_guid);
                  this.setState((prevState) => ({
                    existingDocuments: prevState.existingDocuments.filter(
                      (obj) => obj.mine_document.mine_document_guid !== doc_guid
                    ),
                  }));
                }}
              />
            )}{" "}
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
          <Button className="full-mobile" type="primary" htmlType="submit">
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}
NOWReviewForm.propTypes = propTypes;
NOWReviewForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_NOW_REVIEW,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_NOW_REVIEW),
})(NOWReviewForm);
