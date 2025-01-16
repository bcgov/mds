import React from "react";
import { Field } from "redux-form";
import { Col, Row } from "antd";
import { required } from "@mds/common/redux/utils/Validate";
import { renderConfig } from "@/components/common/config";

export const UnionRepOptions = () => (
  <Row gutter={16}>
    <Col md={12} xs={24}>
      <Field
        id="union_rep_company"
        name="union_rep_company"
        label="Organization"
        placeholder="Organization"
        doNotPinDropdown
        component={renderConfig.FIELD}
        required
        validate={[required]}
      />
    </Col>
  </Row>
);

export default UnionRepOptions;
