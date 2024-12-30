import React from "react";
import { Field } from "redux-form";
import { Col, Form, Row } from "antd";
import { required } from "@common/utils/Validate";
import { renderConfig } from "@/components/common/config";

export const UnionRepOptions = () => (
  <Row gutter={16}>
    <Col md={12} xs={24}>
      <Form.Item>
        <Field
          id="union_rep_company"
          name="union_rep_company"
          label="Organization*"
          placeholder="Organization"
          doNotPinDropdown
          component={renderConfig.FIELD}
          validate={[required]}
        />
      </Form.Item>
    </Col>
  </Row>
);

export default UnionRepOptions;
