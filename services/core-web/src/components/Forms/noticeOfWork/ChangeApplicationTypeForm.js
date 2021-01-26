import React from "react";
import { reduxForm, Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { resetForm } from "@common/utils/helpers";
import { required } from "@common/utils/Validate";
import * as FORM from "@/constants/forms";
import RenderSelect from "@/components/common/RenderSelect";

const propTypes = {};

export const ChangeApplicationTypeForm = () => (
  <Form layout="vertical">
    <Row gutter={16}>
      <Col span={24}>
        <Form.Item>
          <Field
            id="type_of_application"
            name="type_of_application"
            label="Application Type*"
            component={RenderSelect}
            data={[
              { value: "New Permit", label: "New Permit" },
              { value: "Amendment", label: "Amendment" },
            ]}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
  </Form>
);

ChangeApplicationTypeForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CHANGE_NOW_TYPE,
  touchOnBlur: false,
  enableReinitialize: true,
  onSubmitSuccess: resetForm(FORM.CHANGE_NOW_TYPE),
})(ChangeApplicationTypeForm);
