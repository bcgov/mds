import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Col, Row, Popconfirm } from "antd";
import { required, validateSelectOptions } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import RenderAutoSizeField from "@/components/common/RenderAutoSizeField";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";
import CustomPropTypes from "@/customPropTypes";
import RenderField from "@/components/common/RenderField";

const propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
};

export const WithdrawApplicationForm = (props) => (
  <Form layout="vertical" onSubmit={props.handleSubmit}>
    <Row>
      <Col span={24}>
        <Form.Item>
          <Field id="permit_guid" name="permit_guid" label="Permit *" component={RenderField} />
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

WithdrawApplicationForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.WITHDRAW_APPLICATION,
  touchOnBlur: false,
  onSubmitSuccess: resetForm(FORM.WITHDRAW_APPLICATION),
  enableReinitialize: true,
})(WithdrawApplicationForm);
