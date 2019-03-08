import React, { Component } from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import RenderDate from "@/components/common/RenderDate";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import { Form, Button, Col, Row, Popconfirm, Tabs } from "antd";
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

const { TabPane } = Tabs;

class PermitAmendmentForm extends Component {
  onFileLoad = (fileName, document_manager_guid) => {
    this.props.initialValues.uploadedFiles.push({ fileName, document_manager_guid });
    console.log(this.props);
  };

  render() {
    return (
      <Form layout="vertical" onSubmit={this.props.handleSubmit}>
        <Tabs defaultActiveKey="1" style={{ marginTop: "-30px" }}>
          <TabPane tab="Info" key="1">
            <br />
            <Row gutter={16}>
              <Col>
                <Form.Item>
                  <Field
                    id="issue_date"
                    name="issue_date"
                    label="Issue date"
                    component={RenderDate}
                    validate={[required]}
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
            </Row>
          </TabPane>
          <TabPane tab="Files" key="2">
            <Row gutter={16}>
              <Col>
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
          </TabPane>
        </Tabs>
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
  form: FORM.PERMIT_AMENDMENT,
  touchOnBlur: true,
  onSubmitSuccess: resetForm(FORM.PERMIT_AMENDMENT),
})(PermitAmendmentForm);
