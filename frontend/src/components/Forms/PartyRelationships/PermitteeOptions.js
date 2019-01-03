import React from "react";
import PropTypes from "prop-types";
import { Field } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Col, Row } from "antd";
import { required } from "@/utils/Validate";
import { createDropDownList } from "@/utils/helpers";

const propTypes = {
  mine: PropTypes.object,
};

const defaultProps = {
  mine: {},
};

export const PermitteeOptions = (props) => {
  const permitDropdown = createDropDownList(props.mine.mine_permit, "permit_no", "permit_guid");
  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="related_guid"
            name="related_guid"
            label="Permit *"
            placeholder="Select a Permit"
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
PermitteeOptions.defaultProps = defaultProps;

export default PermitteeOptions;
