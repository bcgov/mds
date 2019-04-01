import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm, change } from "redux-form";
import { remove } from "lodash";
import { Form, Button, Col, Row, Popconfirm } from "antd";
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
  mineNo: PropTypes.string.isRequired,
  complianceCodes: PropTypes.arrayOf(CustomPropTypes.dropdownListItem).isRequired,
};

const defaultProps = {};

export class AddVarianceForm extends Component {
  state = {
    uploadedFiles: [],
    filenameGuidMap: {},
  };

  // WIP
  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    this.setState(({ filenameGuidMap }) => ({
      filenameGuidMap: {
        [document_manager_guid]: fileName,
        ...filenameGuidMap,
      },
    }));
    change("uploadedFiles", this.state.uploadedFiles);
  };

  // TODO: Support deletion on backend
  onRemoveFile = (fileItem) => {
    remove(this.state.uploadedFiles, { document_manager_guid: fileItem.serverId });
    // TODO: Update state of filenameGuidMap
    change("uploadedFiles", this.state.uploadedFiles);
  };

  render() {
    return (
      <Form
        layout="vertical"
        onSubmit={this.props.handleSubmit(this.props.onSubmit(this.state.filenameGuidMap))}
      >
        <Row gutter={48}>
          <Col md={12} sm={24} className="border--right--layout">
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
            <Form.Item>
              <Field
                id="received_date"
                name="received_date"
                label="Received date*"
                component={renderConfig.DATE}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
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
                id="note"
                name="note"
                label="Description"
                component={renderConfig.AUTO_SIZE_FIELD}
                validate={[maxLength(300)]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Upload files*">
              <Field
                id="VarianceDocumentFileUpload"
                name="VarianceDocumentFileUpload"
                onFileLoad={this.onFileLoad}
                onRemoveFile={this.onRemoveFile}
                mineGuid={this.props.mineGuid}
                mineNo={this.props.mineNo}
                component={VarianceFileUpload}
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
            disabled={this.props.submitting}
          >
            Add Approved Variance
          </Button>
        </div>
      </Form>
    );
  }
}

AddVarianceForm.propTypes = propTypes;
AddVarianceForm.defaultProps = defaultProps;

export default reduxForm({
  form: FORM.ADD_VARIANCE,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ADD_VARIANCE),
})(AddVarianceForm);
