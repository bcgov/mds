import React from "react";
import PropTypes from "prop-types";
import { Field, reduxForm } from "redux-form";
import { Form } from "@ant-design/compatible";
import "@ant-design/compatible/assets/index.css";
import { Button, Popconfirm, Row, Col } from "antd";
import { required } from "@common/utils/Validate";
import { resetForm } from "@common/utils/helpers";
import * as FORM from "@/constants/forms";
import { renderConfig } from "@/components/common/config";

const propTypes = {
  onCancel: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  layer: PropTypes.number.isRequired,
  initialValues: PropTypes.objectOf(PropTypes.any).isRequired,
};

const placeHolderText = (type) =>
  ({
    SEC: "Sub-Section Name",
    CON: "Type a condition",
    LIS: "Type a list item",
  }[type]);

export const ConditionForm = (props) => {
  const formSpan = 21 - props.layer;
  return (
    <Row gutter={[16, 24]}>
      <Col span={props.layer} />
      <Col span={formSpan}>
        <Form onSubmit={props.handleSubmit}>
          <Field
            id="condition"
            name="condition"
            placeholder={placeHolderText(props.initialValues.condition_type_code)}
            required
            component={
              props.initialValues.condition_type_code === "SEC"
                ? renderConfig.FIELD
                : renderConfig.AUTO_SIZE_FIELD
            }
            validate={[required]}
          />
          <div className="right center-mobile">
            <Popconfirm
              placement="topRight"
              title="Are you sure you want to cancel?"
              onConfirm={props.onCancel}
              okText="Yes"
              cancelText="No"
            >
              <Button className="full-mobile" type="secondary">
                Cancel
              </Button>
            </Popconfirm>
            <Button
              className="full-mobile"
              type="primary"
              htmlType="submit"
              loading={props.submitting}
            >
              Save
            </Button>
          </div>
        </Form>
      </Col>
      <Col span={3} />
    </Row>
  );
};

ConditionForm.propTypes = propTypes;

export default reduxForm({
  form: FORM.CONDITION_SECTION,
  onSubmitSuccess: resetForm(FORM.CONDITION_SECTION),
})(ConditionForm);
