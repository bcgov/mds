import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, dateNotInFuture } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const IssuePermitForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row>
      <Col span={24}>
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
            id="auth_end_date"
            name="auth_end_date"
            label="Authorization End Date"
            required
            component={renderConfig.DATE}
            validate={[required]}
          />
          <Form.Item>
            <Field
              id="description"
              name="description"
              label="Description"
              component={renderConfig.FIELD}
            />
          </Form.Item>
        </Form.Item>
      </Col>
    </Row>
    <div className="right center-mobile">
      <Popconfirm
        placement="topRight"
        title="Are you sure you want to cancel?"
        onConfirm={props.closeModal}
        okText="Yes"
        cancelText="No"
      >
        <Button className="full-mobile" type="secondary">
          Cancel
        </Button>
      </Popconfirm>
      <Button className="full-mobile" type="primary" htmlType="submit" loading={props.submitting}>
        {props.title}
      </Button>
    </div>
  </Form>
);

IssuePermitForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.ISSUE_PERMIT,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.ISSUE_PERMIT),
  enableReinitialize: true,
})(IssuePermitForm);
