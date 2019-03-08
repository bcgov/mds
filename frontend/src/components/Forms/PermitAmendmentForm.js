import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import * as FORM from "@/constants/forms";
import { required, maxLength, dateNotInFuture } from "@/utils/Validate";
import { resetForm } from "@/utils/helpers";
import PermitAmendmentFileUpload from "@/components/mine/Permit/PermitAmendmentFileUpload";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  mine_guid: PropTypes.string.isRequired,
};

class PermitAmendmentForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      uploadedFiles: [],
    };
  }

  onFileLoad = (fileName, document_manager_guid) => {
    this.state.uploadedFiles.push({ fileName, document_manager_guid });
    console.log(this.state);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Row gutter={16}>
          <Col md={12} sm={24}>
            <Form.Item>
              <Field
                id="issue_date"
                name="issue_date"
                label="Issue date"
                component={RenderDate}
                validate={[required, dateNotInFuture]}
              />
            </Form.Item>
            <Form.Item>
              <Field
                id="description"
                name="description"
                label="Description"
                component={RenderAutoSizeField}
                validate={[maxLength(280)]}
              />
            </Form.Item>
          </Col>
          <Col md={12} sm={24}>
            <Form.Item label="Upload/Attach Documents">
              <Field
                id="PermitDocumentFileUpload"
                name="PermitDocumentFileUpload"
                onFileLoad={this.onFileLoad}
                mineGuid={this.props.mine_guid}
                component={PermitAmendmentFileUpload}
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
            {this.props.title}
          </Button>
        </div>
      </Form>
    );
  }
}

PermitAmendmentForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ADD_PERMIT_AMENDMENT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.ADD_PERMIT_AMENDMENT),
})(PermitAmendmentForm);
