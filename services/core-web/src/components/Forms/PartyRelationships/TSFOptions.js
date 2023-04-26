import React from "react";
import { Field } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Col, Row } from "antd";
import { notnone } from "@common/utils/Validate";
import { createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mine: CustomPropTypes.mine,
};

const defaultProps = {
  mine: {},
};

export const TSFOptions = (props) => {
  const tsfDropdown = createDropDownList(
    props.mine.mine_tailings_storage_facilities,
    "mine_tailings_storage_facility_name",
    "mine_tailings_storage_facility_guid"
  );

  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="related_guid"
            name="related_guid"
            label="TSF *"
            placeholder="Select a TSF"
            doNotPinDropdown
            component={renderConfig.SELECT}
            data={tsfDropdown}
            validate={[notnone]}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

TSFOptions.propTypes = propTypes;
TSFOptions.defaultProps = defaultProps;

export default TSFOptions;
