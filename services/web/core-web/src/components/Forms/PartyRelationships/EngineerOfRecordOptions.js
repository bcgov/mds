import React from "react";
import { Field } from "redux-form";
import { Form, Col, Row } from "antd";
import { required } from "@common/utils/Validate";
import { createDropDownList } from "@common/utils/helpers";
import { renderConfig } from "@/components/common/config";
import CustomPropTypes from "@/customPropTypes";

const propTypes = {
  mine: CustomPropTypes.mine,
};

const defaultProps = {
  mine: {},
};

export const EngineerOfRecordOptions = (props) => {
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
            validate={[required]}
          />
        </Form.Item>
      </Col>
    </Row>
  );
};

EngineerOfRecordOptions.propTypes = propTypes;
EngineerOfRecordOptions.defaultProps = defaultProps;

export default EngineerOfRecordOptions;
