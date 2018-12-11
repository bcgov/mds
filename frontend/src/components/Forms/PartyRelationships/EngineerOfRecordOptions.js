import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { renderConfig } from "@/components/common/config";
import { Form, Button, Col, Row, Popconfirm } from "antd";
import { required } from "@/utils/Validate";
import { createDropDownList } from "@/utils/helpers";

const propTypes = {
  mine: PropTypes.object,
};

const defaultProps = {
  mine: {},
};

export const EngineerOfRecordOptions = (props) => {
  const tsfDropdown = createDropDownList(
    props.mine.mine_tailings_storage_facility,
    "mine_tailings_storage_facility_name",
    "mine_tailings_storage_facility_guid"
  );

  return (
    <Row gutter={16}>
      <Col md={12} xs={24}>
        <Form.Item>
          <Field
            id="mine_tailings_storage_facility_guid"
            name="mine_tailings_storage_facility_guid"
            label="TSF *"
            placeholder="Select a TSF"
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
