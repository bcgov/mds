import React from "react";
import { Field } from "redux-form";
import { Form, Col, Row } from "antd";
import { required } from "@common/utils/Validate";
import { createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  minePermits: CustomPropTypes.mine.isRequired,
};

export const PermitteeOptions = (props) => {
  const permitDropdown = createDropDownList(props.minePermits, "permit_no", "permit_guid");

  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="related_guid"
            name="related_guid"
            label="Permit *"
            placeholder="Select a Permit"
            doNotPinDropdown
            component={renderConfig.SELECT}
            data={permitDropdown}
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

PermitteeOptions.propTypes = propTypes;

export default PermitteeOptions;
